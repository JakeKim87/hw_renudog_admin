import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import {
  AgencyTransferUpdateInput,
  useAgencyTransferDetailsQuery,
  useAgencyTransferUpdateMutation,
} from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import createDialogActionHandlers from "@dashboard/utils/handlers/dialogActionHandlers";
import React from "react";
import { useIntl } from "react-intl";

import AgencyTransferDetailsPage from "../components/AgencyTransferDetailsPage";
import AgencyTransferUpdateDialog from "../components/AgencyTransferUpdateDialog";
import {
  agencyTransferDetailsUrl,
  AgencyTransferDetailsUrlDialog,
  AgencyTransferDetailsUrlQueryParams,
} from "../urls";

interface AgencyTransferDetailsProps {
  id: string;
  params: AgencyTransferDetailsUrlQueryParams;
}

const AgencyTransferDetails: React.FC<AgencyTransferDetailsProps> = ({ id, params }) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const intl = useIntl();

  const [openModal, closeModal] = createDialogActionHandlers<
    AgencyTransferDetailsUrlDialog,
    AgencyTransferDetailsUrlQueryParams
  >(navigate, params => agencyTransferDetailsUrl(id, params), params);

  const { data, loading, refetch } = useAgencyTransferDetailsQuery({
    variables: { id },
    displayLoader: true,
  });

  const [updateTransfer, updateResult] = useAgencyTransferUpdateMutation({
    onCompleted: data => {
      if (data.agencyTransferUpdate.errors.length === 0) {
        notify({
          status: "success",
          text: intl.formatMessage({
            id: "transfer_updated",
            defaultMessage: "출고 요청이 업데이트되었습니다.",
          }),
        });
        refetch(); // 데이터 다시 불러오기
        closeModal();
      }
    },
  });

  const handleUpdate = (input: AgencyTransferUpdateInput) => {
    updateTransfer({ variables: { id, input } });
  };

  const confirmButtonState: ConfirmButtonTransitionState = updateResult.loading
    ? "loading"
    : "default";

  return (
    <>
      <AgencyTransferDetailsPage
        transfer={data?.agencyTransfer}
        loading={loading}
        onUpdate={() => openModal("update")}
      />
      <AgencyTransferUpdateDialog
        open={params.action === "update"}
        onClose={closeModal}
        onConfirm={handleUpdate}
        transfer={data?.agencyTransfer}
        confirmButtonState={confirmButtonState}
      />
    </>
  );
};

export default AgencyTransferDetails;
