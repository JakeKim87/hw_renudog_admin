// src/popups/urls.ts

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

const popupSection = "/popups/";

export const popupListPath = popupSection;
export const popupAddPath = urlJoin(popupSection, "add");
export const popupPath = (id: string) => urlJoin(popupSection, id);

// 목록 페이지 URL
export type PopupListUrlDialog = "delete";
export enum PopupListUrlFiltersEnum {
  search = "search",
  isActive = "isActive", // 필터 추가
  displayPage = "displayPage", // 필터 추가
}
export type PopupListUrlFilters = Filters<PopupListUrlFiltersEnum>;

export enum PopupListUrlSortField {
  createdAt = "createdAt",
  title = "title",
}
export type PopupListUrlSort = Sort<PopupListUrlSortField>;

export interface PopupListUrlQueryParams
  extends BulkAction,
    Dialog<PopupListUrlDialog>,
    PopupListUrlFilters,
    PopupListUrlSort,
    Pagination {}

export const popupListUrl = (params?: PopupListUrlQueryParams): string =>
  popupListPath + "?" + stringifyQs(params);

// 생성 페이지 URL
export const popupAddUrl = () => popupAddPath;

// 상세/수정 페이지 URL
export type PopupUrlDialog = "remove";
export type PopupUrlQueryParams = Dialog<PopupUrlDialog> & SingleAction;
export const popupUrl = (id: string, params?: PopupUrlQueryParams) =>
  popupPath(encodeURIComponent(id)) + "?" + stringifyQs(params);