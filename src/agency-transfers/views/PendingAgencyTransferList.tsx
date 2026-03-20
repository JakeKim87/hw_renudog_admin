import { AgencyTransferStatusEnum } from "@dashboard/graphql";
import React from "react";

import { AgencyTransferListUrlQueryParams, pendingAgencyTransfersUrl } from "../urls";
import AgencyTransferList from "./AgencyTransferList";

interface PendingListProps {
  params: AgencyTransferListUrlQueryParams;
}

export const PendingAgencyTransferList: React.FC<PendingListProps> = ({ params }) => (
  <AgencyTransferList
    params={params}
    defaultStatusFilter={[AgencyTransferStatusEnum.PENDING]}
    pageTitle="신규 출고 요청"
    listUrl={pendingAgencyTransfersUrl}
  />
);

export default PendingAgencyTransferList;
