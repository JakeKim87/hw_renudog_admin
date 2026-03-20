import ActionDialog from "@dashboard/components/ActionDialog";
import NotFoundPage from "@dashboard/components/NotFoundPage";
import {
  useFileUploadMutation, // ✅ 1. 파일 업로드 뮤테이션 임포트
  useNoticeDeleteMutation,
  useNoticeDetailsQuery,
  useNoticeFileDeleteMutation,
  useNoticeUpdateMutation,
} from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import React from "react";

import NoticeUpdatePage, { NoticeUpdatePageFormData } from "../../components/NoticeUpdatePage";
import { noticeListUrl, noticeUrl, NoticeUrlQueryParams } from "../../urls";

interface NoticeUpdateProps {
  id: string;
  params: NoticeUrlQueryParams;
}

export const NoticeUpdate: React.FC<NoticeUpdateProps> = ({ id, params }) => {
  const navigate = useNavigator();
  const notify = useNotifier();

  // ✅ 2. 파일 업로드 뮤테이션 훅
  const [uploadFile] = useFileUploadMutation();

  // 1. 데이터 조회
  const { data, loading, refetch } = useNoticeDetailsQuery({
    displayLoader: true,
    variables: { id },
  });

  // 2. 수정 Mutation
  const [updateNotice, updateNoticeOpts] = useNoticeUpdateMutation({
    onCompleted: data => {
      if (data.noticeUpdate.errors.length === 0) {
        notify({ status: "success", text: "공지사항이 성공적으로 수정되었습니다." });
      }
    },
  });

  // 3. 삭제 Mutation
  const [deleteNotice, deleteNoticeOpts] = useNoticeDeleteMutation({
    onCompleted: data => {
      if (data.noticeDelete.errors.length === 0) {
        notify({ status: "success", text: "공지사항이 성공적으로 삭제되었습니다." });
        navigate(noticeListUrl());
      }
    },
  });

  // 4. 파일 삭제 Mutation
  const [deleteNoticeFile] = useNoticeFileDeleteMutation({
    onCompleted: data => {
      if (data.noticeFileDelete.errors.length === 0) {
        notify({ status: "success", text: "파일이 삭제되었습니다." });
        refetch();
      } else {
        notify({ status: "error", text: "파일 삭제 중 오류가 발생했습니다." });
      }
    },
  });

  // ✅ 5. 에디터 전용 이미지 업로드 핸들러 구현
  const handleEditorImageUpload = async (file: File): Promise<string> => {
    try {
      const { data } = await uploadFile({
        variables: { file },
      });

      if (data?.fileUpload?.errors && data.fileUpload.errors.length > 0) {
        const errorMessage = data.fileUpload.errors[0].message;
        notify({ status: "error", text: `이미지 업로드 실패: ${errorMessage}` });
        throw new Error(errorMessage);
      }

      const url = data?.fileUpload?.uploadedFile?.url;
      if (!url) {
        throw new Error("서버로부터 이미지 URL을 받지 못했습니다.");
      }

      return url;
    } catch (error) {
      console.error("Editor Image Upload Error", error);
      throw error;
    }
  };

  const notice = data?.notice;

  if (loading) {
    return null;
  }

  if (notice === null) {
    return <NotFoundPage onBack={() => navigate(noticeListUrl())} />;
  }

  const handleSubmit = (formData: NoticeUpdatePageFormData) => {
    updateNotice({
      variables: {
        id,
        input: {
          title: formData.title,
          content: formData.content,
          isPublished: formData.isPublished,
          ...(formData.image && { image: formData.image }), 
          files: formData.newFiles,
        },
      },
    });
  };

  const handleDelete = () => {
    deleteNotice({ variables: { id } });
  };

  const handleFileDelete = (fileId: string) => {
    deleteNoticeFile({ variables: { id: fileId } });
  };

  return (
    <>
      <NoticeUpdatePage
        notice={notice}
        disabled={loading || updateNoticeOpts.loading}
        saveButtonBarState={updateNoticeOpts.status}
        onBack={() => navigate(noticeListUrl())}
        onSubmit={handleSubmit}
        onDelete={() => navigate(noticeUrl(id, { action: "remove" }))}
        onDeleteFile={handleFileDelete}
        // ✅ 6. 핸들러 전달
        onEditorImageUpload={handleEditorImageUpload}
        errors={updateNoticeOpts.data?.noticeUpdate.errors || []}
      />
      <ActionDialog
        open={params.action === "remove"}
        onClose={() => navigate(noticeUrl(id))}
        onConfirm={handleDelete}
        title="공지사항 삭제"
        variant="delete"
        confirmButtonState={deleteNoticeOpts.status}
      >
        정말로 이 공지사항을 삭제하시겠습니까?
      </ActionDialog>
    </>
  );
};

export default NoticeUpdate;