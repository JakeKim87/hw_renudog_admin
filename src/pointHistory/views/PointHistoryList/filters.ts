import { PointHistoryFilterInput } from "@dashboard/graphql";
import { PointHistoryListUrlQueryParams } from "@dashboard/pointHistory/urls";

export function getFilterVariables(
  params: PointHistoryListUrlQueryParams,
): PointHistoryFilterInput {
  const filter: PointHistoryFilterInput = {};

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
  if (params.query) {
    filter.search = params.query;
  }

  // 3. 구분 (transactionType -> transactionType)
  // 적립(CREDIT) / 사용(DEBIT)
  if (params.transactionType) {
    filter.transactionType = params.transactionType;
  }

  // 필요한 경우 여기에 추가 필터 로직 작성 (예: 특정 병원 user ID 등)

  return filter;
}