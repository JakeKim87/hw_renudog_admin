import { FilterElement } from "@dashboard/components/Filter";
import {
  createFilterTabUtils,
  createFilterUtils,
} from "@dashboard/utils/filters";

import {
  NoticeListUrlFilters,
  NoticeListUrlFiltersEnum,
  NoticeListUrlQueryParams,
} from "./urls";

// 필터 프리셋을 LocalStorage에 저장할 때 사용할 키
export const NOTICE_FILTERS_KEY = "noticeFilters";

// LocalStorage에 필터 프리셋을 저장하고 불러오는 유틸리티 함수 생성
export const {
  deleteFilterTab,
  getFilterTabs,
  saveFilterTab,
} = createFilterTabUtils<NoticeListUrlFilters>(NOTICE_FILTERS_KEY);

// 현재 URL 파라미터 기반으로 활성화된 필터 등을 계산하는 유틸리티 함수 생성
export const {
  areFiltersApplied,
  getActiveFilters,
  getFiltersCurrentTab,
} = createFilterUtils<NoticeListUrlQueryParams, NoticeListUrlFilters>(
  NoticeListUrlFiltersEnum,
);

/**
 * FilterBar 컴포넌트에서 필터가 변경될 때 호출되어,
 * 새로운 URL 파라미터를 생성하는 함수입니다.
 * (Faq 예제와 100% 동일한 로직)
 */
export function getNoticeFilterQueryParam(
  filter: FilterElement<NoticeListUrlFiltersEnum>,
): NoticeListUrlFilters {
  const { name, value } = filter;

  switch (name) {
    // 만약 변경된 필터가 'search'라면, URL 파라미터에 `search=검색어`를 추가/변경합니다.
    case NoticeListUrlFiltersEnum.search:
      return { search: value[0] as string };
  }
}