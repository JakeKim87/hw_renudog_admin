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

const depositHistorySectionUrl = "/deposit-history";

export const depositHistoryListPath = depositHistorySectionUrl;

// 1. 필터 Enum 정의
export enum DepositHistoryListUrlFiltersEnum {
  createdFrom = "createdFrom",
  createdTo = "createdTo",
  query = "query",            // 검색어 (유저 정보, 사유, 결제번호 등)
  transactionType = "transactionType", // 적립/차감 구분 (CREDIT, DEBIT)
}

// 2. 다중 선택 필터 (필요 시 추가)
// export enum DepositHistoryListUrlFiltersWithMultipleValues {
//   ...
// }

// 3. 필터 타입 결합
export type DepositHistoryListUrlFilters = Filters<DepositHistoryListUrlFiltersEnum>;

// 4. 다이얼로그 타입 정의
// 예치금 관리(지급/차감) 모달 키값
export type DepositHistoryListUrlDialog = 
  | "deposit-manage" 
  | TabActionDialog;

// 5. 정렬 필드 정의
export enum DepositHistoryListUrlSortField {
  date = "date",
  amount = "amount", // points 대신 amount 사용
  reason = "reason",
}

export type DepositHistoryListUrlSort = Sort<DepositHistoryListUrlSortField>;

// 6. 최종 쿼리 파라미터 타입 정의
export type DepositHistoryListUrlQueryParams = BulkAction &
  Dialog<DepositHistoryListUrlDialog> &
  DepositHistoryListUrlFilters &
  DepositHistoryListUrlSort &
  Pagination &
  ActiveTab;

// 7. URL 생성 함수
export const depositHistoryListUrl = (
  params?: DepositHistoryListUrlQueryParams,
): string => {
  const depositHistoryList = depositHistoryListPath;

  if (params === undefined) {
    return depositHistoryList;
  } else {
    return urlJoin(depositHistoryList, "?" + stringifyQs(params));
  }
};