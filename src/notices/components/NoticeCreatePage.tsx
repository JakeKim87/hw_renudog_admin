// saleor/dashboard/notices/components/NoticeCreatePage.tsx

import "react-quill/dist/quill.snow.css";

import { Backlink } from "@dashboard/components/Backlink";
import { CardSpacer } from "@dashboard/components/CardSpacer";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import Container from "@dashboard/components/Container";
import Form from "@dashboard/components/Form";
import { Grid } from "@dashboard/components/Grid";
import PageHeader from "@dashboard/components/PageHeader";
import { Savebar } from "@dashboard/components/Savebar";
import { WindowTitle } from "@dashboard/components/WindowTitle";
import { NoticeErrorFragment } from "@dashboard/graphql";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  makeStyles,
  Switch,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useCallback,useMemo, useRef } from "react";
import ReactQuill from "react-quill";

// 스타일 정의 (name 속성 포함)
const useStyles = makeStyles(
  (theme) => ({
    editorContainer: {
      "& .quill": {
        height: "400px",
        marginBottom: "50px",
      },
    },
  }),
  { name: "NoticeCreatePage" }
);

export interface NoticeCreatePageFormData {
  title: string;
  content: string;
  isPublished: boolean;
  image: File | null;
  files: File[];
}

const initialForm: NoticeCreatePageFormData = {
  title: "",
  content: "",
  isPublished: false,
  image: null,
  files: [],
};

interface NoticeCreatePageProps {
  disabled: boolean;
  saveButtonBarState: ConfirmButtonTransitionState;
  errors: NoticeErrorFragment[];
  onBack: () => void;
  onSubmit: (data: NoticeCreatePageFormData) => void;
  // ✅ 에디터 이미지 업로드용 함수 추가 (파일을 주면 URL을 리턴하는 함수)
  onEditorImageUpload: (file: File) => Promise<string>;
}

const NoticeCreatePage: React.FC<NoticeCreatePageProps> = ({
  disabled,
  saveButtonBarState,
  errors,
  onBack,
  onSubmit,
  onEditorImageUpload, // props로 받음
}) => {
  const classes = useStyles();
  const quillRef = useRef<ReactQuill>(null);

  // ✅ 1. 에디터 전용 이미지 핸들러 구현
  const imageHandler = useCallback(() => {
    // 가상의 input 태그를 만들어 파일 선택창을 띄웁니다.
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      try {
        // 부모 컴포넌트에서 전달받은 업로드 함수 실행
        const url = await onEditorImageUpload(file);

        // 에디터 객체 가져오기
        const quill = quillRef.current?.getEditor();
        const range = quill?.getSelection()?.index;

        if (range !== undefined && quill && url) {
          // 에디터에 이미지 태그 삽입
          quill.insertEmbed(range, "image", url);
          // 커서를 이미지 뒤로 이동
          quill.setSelection(range + 1, 0);
        }
      } catch (error) {
        console.error("에디터 이미지 업로드 실패:", error);
        // 필요하다면 에러 알림 처리 (useNotifier 등 사용)
      }
    };
  }, [onEditorImageUpload]);

  // ✅ 2. 모듈 설정 (툴바에 핸들러 연결)
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"], // 이미지 버튼
          ["clean"],
        ],
        handlers: {
          image: imageHandler, // 위에서 만든 핸들러 연결
        },
      },
    }),
    [imageHandler]
  );

  return (
    <Container>
      <WindowTitle title={"공지사항 생성"} />
      <Form initial={initialForm} onSubmit={onSubmit} confirmLeave>
        {({ data, change, submit, isSaveDisabled }) => (
          <>
            <Backlink href="#" onClick={onBack}>
              공지사항 목록
            </Backlink>
            <PageHeader>새 공지사항 생성</PageHeader>
            <Grid>
              {/* --- 좌측 --- */}
              <div>
                <Card>
                  <CardContent>
                    <TextField
                      name="title"
                      label={"제목"}
                      value={data.title}
                      onChange={change}
                      fullWidth
                    />
                  </CardContent>
                </Card>
                <CardSpacer />
                
                {/* ✅ 에디터 영역 */}
                <Card className={classes.editorContainer}>
                  <CardHeader title="내용" />
                  <CardContent>
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      modules={modules} // 커스텀 모듈 적용
                      value={data.content}
                      onChange={(value) => {
                        change({
                          target: {
                            name: "content",
                            value: value,
                          },
                        } as any);
                      }}
                      placeholder="내용을 입력하세요..."
                    />
                  </CardContent>
                </Card>

                {/* 첨부 파일 (기존 코드 유지) */}
                <CardSpacer />
                <Card>
                  <CardHeader title="첨부 파일" />
                  <CardContent>
                    <input
                      style={{ display: "none" }}
                      id="file-upload"
                      multiple
                      type="file"
                      onChange={(event) => {
                        const fileList = event.target.files;
                        if (fileList) {
                          change({
                            target: {
                              name: "files",
                              value: Array.from(fileList),
                            },
                          } as any);
                        }
                      }}
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outlined" component="span">
                        파일 선택
                      </Button>
                    </label>
                    {data.files.length > 0 && (
                      <Typography variant="body2" style={{ marginTop: 10 }}>
                        선택된 파일: {data.files.length}개
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* --- 우측 --- */}
              <div>
                <Card>
                  <CardHeader title={"게시 설정"} />
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          name="isPublished"
                          checked={data.isPublished}
                          onChange={(event) => {
                            change({
                              target: {
                                name: "isPublished",
                                value: event.target.checked,
                              },
                            } as any);
                          }}
                        />
                      }
                      label="공개"
                    />
                    <Typography variant="caption">
                      이 옵션을 활성화하면 공지사항이 사용자에게 표시됩니다.
                    </Typography>
                  </CardContent>
                </Card>
                
                <CardSpacer />
                
                {/* ✅ 대표 이미지 (기존 코드 원상복구) */}
                <Card>
                  <CardHeader title="대표 이미지" />
                  <CardContent>
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="image-upload"
                      type="file"
                      onChange={(event) => {
                        const file = event.target.files ? event.target.files[0] : null;
                        change({
                          target: {
                            name: "image",
                            value: file,
                          },
                        } as any);
                      }}
                    />
                    <label htmlFor="image-upload">
                      <Button variant="outlined" component="span" fullWidth>
                        이미지 업로드
                      </Button>
                    </label>
                    {data.image && (
                      <div style={{ marginTop: 10 }}>
                        <Typography variant="body2">
                          선택됨: {data.image.name}
                        </Typography>
                        <img 
                          src={URL.createObjectURL(data.image)} 
                          alt="preview" 
                          style={{ maxWidth: "100%", marginTop: 8 }} 
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </Grid>
            <Savebar>
              <Savebar.CancelButton onClick={onBack} />
              <Savebar.ConfirmButton
                transitionState={saveButtonBarState}
                onClick={submit}
                disabled={isSaveDisabled || disabled}
              >
                공지사항 저장
              </Savebar.ConfirmButton>
            </Savebar>
          </>
        )}
      </Form>
    </Container>
  );
};

NoticeCreatePage.displayName = "NoticeCreatePage";
export default NoticeCreatePage;