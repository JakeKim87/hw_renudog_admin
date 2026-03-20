import ActionDialog from "@dashboard/components/ActionDialog";
import NotFoundPage from "@dashboard/components/NotFoundPage";
import FaqUpdatePage, { FaqUpdatePageFormData } from "@dashboard/faq/components/FaqUpdatePage";
import {
  useFaqDeleteMutation,
  useFaqDetailsQuery,
  useFaqUpdateMutation,
} from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import React from "react";

import { faqListUrl, faqUrl, FaqUrlQueryParams } from "../../urls";

interface FaqUpdateProps {
  id: string;
  params: FaqUrlQueryParams;
}

export const FaqUpdate: React.FC<FaqUpdateProps> = ({ id, params }) => {
  const navigate = useNavigator();
  const notify = useNotifier();

  // 1. 데이터 조회
  const { data, loading } = useFaqDetailsQuery({
    displayLoader: true,
    variables: { id },
  });

  // 2. 수정 뮤테이션 정의
  const [updateFaq, updateFaqOpts] = useFaqUpdateMutation({
    onCompleted: data => {
      if (data.faqUpdate.errors.length === 0) {
        notify({ status: "success", text: "FAQ가 성공적으로 수정되었습니다." });
      }
    },
  });

  // 3. 삭제 뮤테이션 정의
  const [deleteFaq, deleteFaqOpts] = useFaqDeleteMutation({
    onCompleted: data => {
      if (data.faqDelete.errors.length === 0) {
        notify({ status: "success", text: "FAQ가 성공적으로 삭제되었습니다." });
        navigate(faqListUrl()); // 삭제 후 목록으로 이동
      }
    },
  });

  const faq = data?.faq;

  if (faq === null) {
    return <NotFoundPage onBack={() => navigate(faqListUrl())} />;
  }

  // 4. 핸들러 함수 정의
  const handleSubmit = (formData: FaqUpdatePageFormData) => {
    updateFaq({
      variables: {
        id,
        input: {
          title: formData.title,
          content: formData.content,
        },
      },
    });
  };

  const handleDelete = () => {
    deleteFaq({ variables: { id } });
  };

  return (
    <>
      <FaqUpdatePage
        faq={faq}
        disabled={loading || updateFaqOpts.loading}
        saveButtonBarState={updateFaqOpts.status}
        onBack={() => navigate(faqListUrl())}
        onSubmit={handleSubmit}
        onDelete={() => navigate(faqUrl(id, { action: "remove" }))} // 삭제 다이얼로그 열기
        errors={updateFaqOpts.data?.faqUpdate.errors || []}
      />
      <ActionDialog
        open={params.action === "remove"}
        onClose={() => navigate(faqUrl(id))}
        onConfirm={handleDelete}
        title="FAQ 삭제"
        variant="delete"
        // 👇 누락되었던 confirmButtonState prop 추가
        confirmButtonState={deleteFaqOpts.status}
      >
        정말로 이 FAQ를 삭제하시겠습니까?
      </ActionDialog>
    </>
  );
};

export default FaqUpdate;