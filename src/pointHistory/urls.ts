import { stringifyQs } from "@dashboard/utils/urls";
import urlJoin from "url-join";

import {
  ActiveTab,
  BulkAction,
  Dialog,
  Filters,
  Pagination,
  Sort,
  TabActionDialog,
} from "../types";

const pointHistorySectionUrl = "/point-history";

export const pointHistoryListPath = pointHistorySectionUrl;

// 1. 필터 Enum 정의
// React 컴포넌트에서 사용하는 필터 키값들과 일치해야 합니다.
export enum PointHistoryListUrlFiltersEnum {
  createdFrom = "createdFrom",
  createdTo = "createdTo",
  query = "query",            // 검색어 (병원명, 이메일, 사유 등)
  transactionType = "transactionType", // 적립/사용 구분 (CREDIT, DEBIT)
}

// 2. 다중 선택 필터 (현재는 없지만 확장을 위해 구조 유지)
// export enum PointHistoryListUrlFiltersWithMultipleValues {
//   ...
// }

// 3. 필터 타입 결합
export type PointHistoryListUrlFilters = Filters<PointHistoryListUrlFiltersEnum>;

// 4. 다이얼로그 타입 정의
// 포인트 수동 지급/차감 같은 기능을 모달로 띄운다면 여기에 추가합니다.
export type PointHistoryListUrlDialog = 
  | "point-manage" // 포인트 관리(지급/차감) 모달 예시
  | TabActionDialog;

// 5. 정렬 필드 정의
export enum PointHistoryListUrlSortField {
  date = "date",
  points = "points",
  reason = "reason",
}

export type PointHistoryListUrlSort = Sort<PointHistoryListUrlSortField>;

// 6. 최종 쿼리 파라미터 타입 정의
export type PointHistoryListUrlQueryParams = BulkAction &
  Dialog<PointHistoryListUrlDialog> &
  PointHistoryListUrlFilters &
  PointHistoryListUrlSort &
  Pagination &
  ActiveTab;

// 7. URL 생성 함수
export const pointHistoryListUrl = (
  params?: PointHistoryListUrlQueryParams,
): string => {
  const pointHistoryList = pointHistoryListPath;

  if (params === undefined) {
    return pointHistoryList;
  } else {
    return urlJoin(pointHistoryList, "?" + stringifyQs(params));
  }
};