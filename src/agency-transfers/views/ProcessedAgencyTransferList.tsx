import { AgencyTransferStatusEnum } from "@dashboard/graphql";
import React from "react";

import { AgencyTransferListUrlQueryParams, processedAgencyTransfersUrl } from "../urls";
import AgencyTransferList from "./AgencyTransferList";

interface ProcessedListProps {
  params: AgencyTransferListUrlQueryParams;
}

export const ProcessedAgencyTransferList: React.FC<ProcessedListProps> = ({ params }) => (
  <AgencyTransferList
    params={params}
    defaultStatusFilter={[
      AgencyTransferStatusEnum.SHIPPED,
      AgencyTransferStatusEnum.DELIVERED,
      AgencyTransferStatusEnum.CANCELLED,
    ]}
    pageTitle="처리된 출고 요청"
    listUrl={processedAgencyTransfersUrl}
  />
);

export default ProcessedAgencyTransferList;
