import ActionDialog from "@dashboard/components/ActionDialog";
import NotFoundPage from "@dashboard/components/NotFoundPage";
import {
  useSalesRepresentativeDeleteMutation,
  useSalesRepresentativeDetailsQuery,
  useSalesRepresentativeUpdateMutation,
} from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import React from "react";

import {
  salesRepresentativeListUrl,
  salesRepresentativeUrl,
  SalesRepresentativeUrlQueryParams,
} from "../../urls";
import SalesRepresentativeUpdatePage, { SalesRepresentativeUpdatePageFormData } from "@dashboard/salesRepresentatives/components/SalesRepresentativeUpdatePage";

interface SalesRepresentativeUpdateProps {
  id: string;
  params: SalesRepresentativeUrlQueryParams;
}

export const SalesRepresentativeUpdate: React.FC<SalesRepresentativeUpdateProps> = ({
  id,
  params,
}) => {
  const navigate = useNavigator();
  const notify = useNotifier();

  const { data, loading } = useSalesRepresentativeDetailsQuery({
    displayLoader: true,
    variables: { id },
  });

  const [updateRep, updateRepOpts] = useSalesRepresentativeUpdateMutation({
    onCompleted: data => {
      if (data.salesRepresentativeUpdate.errors.length === 0) {
        notify({
          status: "success",
          text: "정보가 성공적으로 수정되었습니다.",
        });
      }
    },
  });

  const [deleteRep, deleteRepOpts] = useSalesRepresentativeDeleteMutation({
    onCompleted: data => {
      if (data.salesRepresentativeDelete.errors.length === 0) {
        notify({
          status: "success",
          text: "성공적으로 삭제되었습니다.",
        });
        navigate(salesRepresentativeListUrl());
      }
    },
  });

  const rep = data?.salesRepresentative;

  if (rep === null) {
    return <NotFoundPage onBack={() => navigate(salesRepresentativeListUrl())} />;
  }

  const handleSubmit = (formData: SalesRepresentativeUpdatePageFormData) => {
    updateRep({
      variables: {
        id,
        input: {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
        },
      },
    });
  };

  const handleDelete = () => {
    deleteRep({ variables: { id } });
  };

  return (
    <>
      <SalesRepresentativeUpdatePage
        rep={rep}
        disabled={loading || updateRepOpts.loading}
        saveButtonBarState={updateRepOpts.status}
        onBack={() => navigate(salesRepresentativeListUrl())}
        onSubmit={handleSubmit}
        onDelete={() => navigate(salesRepresentativeUrl(id, { action: "remove" }))}
        errors={updateRepOpts.data?.salesRepresentativeUpdate.errors || []}
      />
      <ActionDialog
        open={params.action === "remove"}
        onClose={() => navigate(salesRepresentativeUrl(id))}
        onConfirm={handleDelete}
        title="삭제"
        variant="delete"
        confirmButtonState={deleteRepOpts.status}
      >
        정말로 삭제하시겠습니까?
      </ActionDialog>
    </>
  );
};

export default SalesRepresentativeUpdate;