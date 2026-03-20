import { useSalesRepresentativeCreateMutation } from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import React from "react";

import SalesRepresentativeCreatePage, {
  SalesRepresentativeCreatePageFormData,
} from "../../components/SalesRepresentativeCreatePage";
import { salesRepresentativeListUrl, salesRepresentativeUrl } from "../../urls";

export const SalesRepresentativeCreate: React.FC = () => {
  const navigate = useNavigator();
  const notify = useNotifier();

  const [createRep, createRepOpts] = useSalesRepresentativeCreateMutation({
    onCompleted: data => {
      if (data.salesRepresentativeCreate.errors.length === 0) {
        notify({
          status: "success",
          text: "성공적으로 생성되었습니다.",
        });
        navigate(salesRepresentativeUrl(data.salesRepresentativeCreate.salesRepresentative.id));
      }
    },
  });

  const handleSubmit = (formData: SalesRepresentativeCreatePageFormData) => {
    createRep({
      variables: {
        input: {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
        },
      },
    });
  };

  return (
    <SalesRepresentativeCreatePage
      disabled={createRepOpts.loading}
      saveButtonBarState={createRepOpts.status}
      onBack={() => navigate(salesRepresentativeListUrl())}
      onSubmit={handleSubmit}
      errors={createRepOpts.data?.salesRepresentativeCreate.errors || []}
    />
  );
};

export default SalesRepresentativeCreate;