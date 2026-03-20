// src/events/urls.ts

import urlJoin from "url-join";

import { BulkAction, Dialog, Filters, Pagination, SingleAction, Sort } from "../types";
import { stringifyQs } from "../utils/urls";

// =================================================================
// 이벤트 (Event) 페이지
// =================================================================

const eventSection = "/events/";

export const eventListPath = eventSection;
export const eventAddPath = urlJoin(eventSection, "add");
export const eventPath = (id: string) => urlJoin(eventSection, id);

// --- 목록 페이지 ---
export type EventListUrlDialog = "delete";
export enum EventListUrlSortField {
  startDate = "startDate",
}
export type EventListUrlSort = Sort<EventListUrlSortField>;
export interface EventListUrlQueryParams
  extends BulkAction,
    Dialog<EventListUrlDialog>,
    EventListUrlSort,
    Pagination {}
export const eventListUrl = (params?: EventListUrlQueryParams): string =>
  eventListPath + "?" + stringifyQs(params);

// --- 생성 페이지 ---
export const eventAddUrl = () => eventAddPath;

// --- 상세/수정 페이지 ---
export type EventUrlDialog = "remove";
export type EventUrlQueryParams = Dialog<EventUrlDialog> & SingleAction;
export const eventUrl = (id: string, params?: EventUrlQueryParams) =>
  eventPath(encodeURIComponent(id)) + "?" + stringifyQs(params);

// =================================================================
// 제출 내역 (Submission) 페이지
// =================================================================

const eventSubmissionSection = "/event-submissions/";

export const eventSubmissionListPath = eventSubmissionSection;
// --- 상세/수정 페이지 URL 경로 추가 ---
export const eventSubmissionPath = (id: string) => urlJoin(eventSubmissionSection, id);

// --- 목록 페이지 ---
export type EventSubmissionListUrlDialog = "approve" | "reject";
export enum EventSubmissionListUrlFiltersEnum {
  status = "status",
  event = "event",
  search = "search",
}
export type EventSubmissionListUrlFilters = Filters<EventSubmissionListUrlFiltersEnum>;

export enum EventSubmissionListUrlSortField {
  submittedAt = "submittedAt",
}
export type EventSubmissionListUrlSort = Sort<EventSubmissionListUrlSortField>;

export interface EventSubmissionListUrlQueryParams
  extends BulkAction,
    Dialog<EventSubmissionListUrlDialog>,
    EventSubmissionListUrlFilters,
    EventSubmissionListUrlSort,
    Pagination {}

export const eventSubmissionListUrl = (params?: EventSubmissionListUrlQueryParams): string =>
  eventSubmissionListPath + "?" + stringifyQs(params);

// --- 상세/수정 페이지 URL 정의 추가 ---
// 상세 페이지에서는 '승인', '반려'와 같은 액션 다이얼로그를 열 수 있습니다.
export type EventSubmissionUrlDialog = "approve" | "reject";
export type EventSubmissionUrlQueryParams = Dialog<EventSubmissionUrlDialog> & SingleAction;
export const eventSubmissionUrl = (id: string, params?: EventSubmissionUrlQueryParams) =>
  eventSubmissionPath(encodeURIComponent(id)) + "?" + stringifyQs(params);