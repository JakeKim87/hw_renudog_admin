// @ts-strict-ignore
// 1. Saleor가 제공하는 표준 파일 업로드 GraphQL 훅을 import 합니다.
import { useFileUploadMutation } from "@dashboard/graphql";
import EditorJS, { EditorConfig, OutputData, ToolConstructable } from "@editorjs/editorjs";
import ImageTool from "@editorjs/image";
import Paragraph from "@editorjs/paragraph";
import {
  EditorCore,
  Props as ReactEditorJSProps,
  ReactEditorJS as BaseReactEditorJS,
} from "@react-editor-js/core";
import React, { useCallback } from "react";

/**
 * 이 함수는 Apollo의 `uploadFile` 함수를 Editor.js의 `uploadByFile`이
 * 요구하는 형식으로 감싸주는 "어댑터" 역할을 합니다.
 * @param uploadFile - useFileUploadMutation 훅에서 반환된 뮤테이션 함수
 * @returns Editor.js의 uploader가 사용할 수 있는 비동기 함수
 */
const createUploadByFile =
  (uploadFile: ReturnType<typeof useFileUploadMutation>[0]) => async (file: File) => {
    try {
      // Apollo 훅을 사용해 파일을 업로드합니다.
      const result = await uploadFile({
        variables: {
          file,
        },
      });

      const data = result.data?.fileUpload;

      // GraphQL 에러가 있는지 확인합니다.
      if (data?.errors?.length) {
        console.error("Image upload GraphQL errors:", data.errors);

        return { success: 0, file: { url: null } };
      }

      // 성공 시 Editor.js가 요구하는 형식으로 URL을 반환합니다.
      return {
        success: 1,
        file: {
          url: data.uploadedFile.url,
        },
      };
    } catch (error) {
      // 네트워크 에러 등 fetch 자체가 실패한 경우
      console.error("Image upload network error:", error);

      return { success: 0, file: { url: null } };
    }
  };

// Source of @react-editor-js
class ClientEditorCore implements EditorCore {
  private readonly _editorJS: EditorJS;

  // 2. 생성자에서 uploadByFile 함수를 옵션으로 받도록 타입을 확장합니다.
  constructor({
    tools,
    uploadByFile,
    ...config
  }: EditorConfig & { uploadByFile?: (file: File) => Promise<any> }) {
    const extendTools = {
      // default tools
      paragraph: {
        class: Paragraph,
        inlineToolbar: true,
      } as unknown as ToolConstructable,
      ...tools,

      // 3. 이미지 도구 설정을 여기에 고정합니다.
      image: {
        class: ImageTool,
        config: {
          uploader: {
            // 외부에서 주입받은 업로드 함수를 사용합니다.
            uploadByFile,
          },
        },
      },
    };

    this._editorJS = new EditorJS({
      tools: extendTools,
      ...config,
    });
  }

  public async clear() {
    await this._editorJS.clear();
  }

  public async save() {
    await this._editorJS.isReady;

    return this._editorJS.save();
  }

  public async destroy() {
    try {
      if (this._editorJS) {
        await this._editorJS.isReady;
        this._editorJS.destroy();
      }
    } catch (e) {
      // ...
    }
  }

  public async render(data: OutputData) {
    await this._editorJS.render(data);
  }
}

export type Props = Omit<ReactEditorJSProps, "factory">;

function ReactEditorJSClient(props: Props) {
  // 4. React 컴포넌트 레벨에서 훅을 안전하게 호출합니다.
  const [uploadFileMutation] = useFileUploadMutation();

  // 5. 에디터 인스턴스를 생성하는 factory 함수를 정의합니다.
  //    useCallback을 사용하여 불필요한 재생성을 막습니다.
  const factory = useCallback(
    (config: EditorConfig) =>
      new ClientEditorCore({
        ...config,
        // 6. 훅에서 얻은 뮤테이션 함수를 어댑터로 감싸서 생성자에 주입합니다.
        uploadByFile: createUploadByFile(uploadFileMutation),
      }),
    [uploadFileMutation],
  );

  return <BaseReactEditorJS factory={factory} {...props} />;
}

export const ReactEditorJS = ReactEditorJSClient;
