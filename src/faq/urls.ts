import urlJoin from "url-join";

import {
  BulkAction,
  Dialog,
  Filters,
  Pagination,
  SingleAction,
  Sort,
} from "../types";
import { stringifyQs } from "../utils/urls";

const faqSection = "/faq/";

export const faqListPath = faqSection;
export const faqAddPath = urlJoin(faqSection, "add");
export const faqPath = (id: string) => urlJoin(faqSection, id);

// 목록 페이지 URL
export type FaqListUrlDialog = "delete" | "create-faq";
export enum FaqListUrlFiltersEnum {
  search = "search",
  category = "category",
}
export type FaqListUrlFilters = Filters<FaqListUrlFiltersEnum>;

export enum FaqListUrlSortField {
  createdAt = "createdAt",
  title = "title",
  viewCount = "viewCount",
}
export type FaqListUrlSort = Sort<FaqListUrlSortField>;

export interface FaqListUrlQueryParams
  extends BulkAction,
    Dialog<FaqListUrlDialog>,
    FaqListUrlFilters,
    FaqListUrlSort,
    Pagination {}

export const faqListUrl = (params?: FaqListUrlQueryParams): string =>
  faqListPath + "?" + stringifyQs(params);

// 생성 페이지 URL
export const faqAddUrl = () => faqAddPath;

// 상세/수정 페이지 URL
export type FaqUrlDialog = "remove";
export type FaqUrlQueryParams = Dialog<FaqUrlDialog> & SingleAction;
export const faqUrl = (id: string, params?: FaqUrlQueryParams) =>
  faqPath(encodeURIComponent(id)) + "?" + stringifyQs(params);