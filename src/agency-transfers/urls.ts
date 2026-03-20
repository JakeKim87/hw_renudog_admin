import { stringifyQs } from "@dashboard/utils/urls";
import urlJoin from "url-join";

import { BulkAction, Dialog, Pagination, SingleAction } from "../types";

const agencyTransfersSection = "/agency-transfers";

export const pendingAgencyTransfersPath = urlJoin(agencyTransfersSection, "pending");
export const processedAgencyTransfersPath = urlJoin(agencyTransfersSection, "processed");

// Dialog, BulkAction 등 필요한 타입 추가
export type AgencyTransferListUrlDialog = "update" | "cancel"; // 예시
export type AgencyTransferListUrlQueryParams = BulkAction &
  SingleAction &
  Dialog<AgencyTransferListUrlDialog> &
  Pagination;

export const pendingAgencyTransfersUrl = (params?: AgencyTransferListUrlQueryParams): string => {
  if (params === undefined) {
    return pendingAgencyTransfersPath;
  } else {
    return urlJoin(pendingAgencyTransfersPath, "?" + stringifyQs(params));
  }
};

export const processedAgencyTransfersUrl = (params?: AgencyTransferListUrlQueryParams): string => {
  if (params === undefined) {
    return processedAgencyTransfersPath;
  } else {
    return urlJoin(processedAgencyTransfersPath, "?" + stringifyQs(params));
  }
};

export const agencyTransferDetailsPath = (id: string) => urlJoin(agencyTransfersSection, id);

// 상세 페이지에서 사용할 Dialog 타입
export type AgencyTransferDetailsUrlDialog = "update";

// 상세 페이지에서 사용할 URL Query Params 타입
export type AgencyTransferDetailsUrlQueryParams = Dialog<AgencyTransferDetailsUrlDialog> &
  SingleAction;

export const agencyTransferDetailsUrl = (
  id: string,
  params?: AgencyTransferDetailsUrlQueryParams,
): string => agencyTransferDetailsPath(encodeURIComponent(id)) + "?" + stringifyQs(params);
