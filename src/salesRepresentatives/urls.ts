import { BulkAction, Dialog, SingleAction } from "@dashboard/types";
import { stringifyQs } from "@dashboard/utils/urls";
import urlJoin from "url-join";

const salesRepresentativesSection = "/sales-representatives/";

export const salesRepresentativeListPath = salesRepresentativesSection;
export const salesRepresentativeAddPath = urlJoin(salesRepresentativesSection, "add");
export const salesRepresentativePath = (id: string) => urlJoin(salesRepresentativesSection, id);

// --- 목록 페이지 URL ---
export type SalesRepresentativeListUrlDialog = "delete";
export interface SalesRepresentativeListUrlQueryParams
  extends BulkAction,
    Dialog<SalesRepresentativeListUrlDialog> {}

export const salesRepresentativeListUrl = (params?: SalesRepresentativeListUrlQueryParams): string =>
  salesRepresentativeListPath + "?" + stringifyQs(params);

// --- 생성 페이지 URL ---
export const salesRepresentativeAddUrl = () => salesRepresentativeAddPath;

// --- 상세/수정 페이지 URL ---
export type SalesRepresentativeUrlDialog = "remove";
export type SalesRepresentativeUrlQueryParams = Dialog<SalesRepresentativeUrlDialog> & SingleAction;
export const salesRepresentativeUrl = (id: string, params?: SalesRepresentativeUrlQueryParams) =>
  salesRepresentativePath(encodeURIComponent(id)) + "?" + stringifyQs(params);