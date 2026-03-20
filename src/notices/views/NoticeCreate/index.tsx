// saleor/dashboard/notices/views/NoticeCreate.tsx

import { 
  useFileUploadMutation, // ✅ 1. 파일 업로드 뮤테이션 임포트
  useNoticeCreateMutation} from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import React from "react";

import NoticeCreatePage, { NoticeCreatePageFormData } from "../../components/NoticeCreatePage";
import { noticeListUrl, noticeUrl } from "../../urls";

const NoticeCreate: React.FC = () => {
  const navigate = useNavigator();
  const notify = useNotifier();

  // ✅ 2. 파일 업로드 뮤테이션 훅 초기화
  // (Saleor의 표준 파일 업로드 API입니다. ProductMedia 등에서도 유사한 방식을 사용합니다)
  const [uploadFile] = useFileUploadMutation();

  const [createNotice, createNoticeOpts] = useNoticeCreateMutation({
    onCompleted: data => {
      if (data.noticeCreate.errors.length === 0) {
        notify({ status: "success", text: "공지사항이 성공적으로 생성되었습니다." });
        navigate(noticeUrl(data.noticeCreate.notice.id));
      }
    },
  });

  // ✅ 3. 에디터 전용 이미지 업로드 핸들러 구현
  // 이 함수는 File을 받아서 서버에 올리고, 이미지 URL(string)을 반환해야 합니다.
  const handleEditorImageUpload = async (file: File): Promise<string> => {
    try {
      const { data } = await uploadFile({
        variables: { file },
      });

      // 에러 체크
      if (data?.fileUpload?.errors && data.fileUpload.errors.length > 0) {
        const errorMessage = data.fileUpload.errors[0].message;
        notify({ status: "error", text: `이미지 업로드 실패: ${errorMessage}` });
        throw new Error(errorMessage);
      }

      // URL 반환
      const url = data?.fileUpload?.uploadedFile?.url;
      if (!url) {
        throw new Error("서버로부터 이미지 URL을 받지 못했습니다.");
      }

      return url;
    } catch (error) {
      console.error("Editor Image Upload Error", error);
      throw error; // 에러를 던져야 Page 컴포넌트에서 중단 가능
    }
  };

  const handleSubmit = (formData: NoticeCreatePageFormData) => {
    createNotice({
      variables: {
        input: {
          title: formData.title,
          content: formData.content,
          isPublished: formData.isPublished,
          image: formData.image,
          files: formData.files,
        },
      },
    });
  };

  return (
    <NoticeCreatePage
      disabled={createNoticeOpts.loading}
      saveButtonBarState={createNoticeOpts.status}
      onBack={() => navigate(noticeListUrl())}
      onSubmit={handleSubmit}
      errors={createNoticeOpts.data?.noticeCreate.errors || []}
      // ✅ 4. 핸들러 전달
      onEditorImageUpload={handleEditorImageUpload}
    />
  );
};

export default NoticeCreate;