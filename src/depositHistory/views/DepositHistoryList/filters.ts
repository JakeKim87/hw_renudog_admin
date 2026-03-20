import { DepositHistoryListUrlQueryParams } from "@dashboard/depositHistory/urls";
import { DepositHistoryFilterInput } from "@dashboard/graphql";

export function getFilterVariables(
  params: DepositHistoryListUrlQueryParams,
): DepositHistoryFilterInput {
  const filter: DepositHistoryFilterInput = {};

  // 1. 날짜 필터 (createdFrom, createdTo -> createdAt: { gte, lte })
  if (params.createdFrom || params.createdTo) {
    filter.createdAt = {}; // 중요: 빈 객체 초기화

    if (params.createdFrom) {
      filter.createdAt.gte = params.createdFrom; // 시작일
    }

    if (params.createdTo) {
      filter.createdAt.lte = params.createdTo;   // 종료일
    }
  }

  // 2. 검색어 (query -> search)
  // 백엔드 필터에서 정의한 대로 User 정보, 사유, 결제 주문번호 등을 검색합니다.
  if (params.query) {
    filter.search = params.query;
  }

  // 3. 구분 (transactionType -> transactionType)
  // 적립(CREDIT) / 차감(DEBIT)
  if (params.transactionType) {
    filter.transactionType = params.transactionType;
  }

  return filter;
}