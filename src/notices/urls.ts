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

const noticeSection = "/notices/";

export const noticeListPath = noticeSection;
export const noticeAddPath = urlJoin(noticeSection, "add");
export const noticePath = (id: string) => urlJoin(noticeSection, id);

// 목록 페이지 URL
export type NoticeListUrlDialog = "delete";
export enum NoticeListUrlFiltersEnum {
  search = "search", // Notice는 search 필터만 가집니다.
}
export type NoticeListUrlFilters = Filters<NoticeListUrlFiltersEnum>;

export enum NoticeListUrlSortField {
  createdAt = "createdAt",
  title = "title",
  viewCount = "viewCount",
}
export type NoticeListUrlSort = Sort<NoticeListUrlSortField>;

export interface NoticeListUrlQueryParams
  extends BulkAction,
    Dialog<NoticeListUrlDialog>,
    NoticeListUrlFilters,
    NoticeListUrlSort,
    Pagination {}

export const noticeListUrl = (params?: NoticeListUrlQueryParams): string =>
  noticeListPath + "?" + stringifyQs(params);

// 생성 페이지 URL
export const noticeAddUrl = () => noticeAddPath;

// 상세/수정 페이지 URL
export type NoticeUrlDialog = "remove";
export type NoticeUrlQueryParams = Dialog<NoticeUrlDialog> & SingleAction;
export const noticeUrl = (id: string, params?: NoticeUrlQueryParams) =>
  noticePath(encodeURIComponent(id)) + "?" + stringifyQs(params);