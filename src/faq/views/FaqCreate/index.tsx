import { useFaqCreateMutation } from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import React from "react";

import FaqCreatePage, { FaqCreatePageFormData } from "../../components/FaqCreatePage";
import { faqListUrl, faqUrl } from "../../urls";

const FaqCreate: React.FC = () => {
  const navigate = useNavigator();
  const notify = useNotifier();

  const [createFaq, createFaqOpts] = useFaqCreateMutation({
    onCompleted: data => {
      if (data.faqCreate.errors.length === 0) {
        notify({ status: "success", text: "FAQ가 성공적으로 생성되었습니다." });
        navigate(faqUrl(data.faqCreate.faq.id));
      }
    },
  });

  const handleSubmit = (formData: FaqCreatePageFormData) => {
    createFaq({
      variables: {
        input: {
          title: formData.title,
          content: formData.content,
        },
      },
    });
  };

  return (
    <FaqCreatePage
      disabled={createFaqOpts.loading}
      saveButtonBarState={createFaqOpts.status}
      onBack={() => navigate(faqListUrl())}
      onSubmit={handleSubmit}
      errors={createFaqOpts.data?.faqCreate.errors || []}
    />
  );
};

export default FaqCreate;