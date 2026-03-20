import { useFaqsQuery } from "@dashboard/graphql";
import useListSettings from "@dashboard/hooks/useListSettings";
import useNavigator from "@dashboard/hooks/useNavigator";
import usePaginator, {
  createPaginationState,
  PaginatorContext,
} from "@dashboard/hooks/usePaginator";
import { ListViews } from "@dashboard/types";
import createSortHandler from "@dashboard/utils/handlers/sortHandler";
import { mapEdgesToItems } from "@dashboard/utils/maps";
import { getSortParams } from "@dashboard/utils/sort";
import React from "react";

import FaqListPage from "../../components/FaqListPage";
import {
  faqAddUrl,
  faqListUrl,
  FaqListUrlQueryParams,
  faqUrl,
} from "../../urls";

interface FaqListProps {
  params: FaqListUrlQueryParams;
}

export const FaqList: React.FC<FaqListProps> = ({ params }) => {
  const navigate = useNavigator();
  const { updateListSettings, settings } = useListSettings(ListViews.FAQ_LIST);

  // 1. 페이지네이션 상태를 생성합니다.
  const paginationState = createPaginationState(settings.rowNumber, params);

  // 2. 쿼리 변수를 준비합니다 (필터, 정렬 등).
  //    (이 부분은 이전에 만든 필터/정렬 헬퍼 파일이 필요합니다)
  const queryVariables = React.useMemo(
    () => ({
      ...paginationState,
      // filter: getFilterVariables(params),
      // sortBy: getSortQueryVariables(params),
    }),
    [params, settings.rowNumber],
  );

  // 3. 데이터를 가져옵니다.
  const { data, loading } = useFaqsQuery({
    displayLoader: true,
    variables: queryVariables,
  });

  // 4. usePaginator 훅을 사용하여 페이지네이션 값을 계산합니다.
  const paginationValues = usePaginator({
    pageInfo: data?.faqs?.pageInfo,
    paginationState,
    queryString: params,
  });

  // 5. 나머지 핸들러들을 준비합니다.
  const faqs = mapEdgesToItems(data?.faqs);
  const handleSort = createSortHandler(navigate, faqListUrl, params);

  return (
    // 6. PaginatorContext.Provider로 하위 컴포넌트를 감쌉니다.
    <PaginatorContext.Provider value={paginationValues}>
      <FaqListPage
        faqs={faqs}
        settings={settings}
        disabled={loading}
        // pageInfo는 Context를 통해 전달되므로 여기서 넘길 필요가 없습니다.
        onUpdateListSettings={updateListSettings}
        onRowClick={id => navigate(faqUrl(id))}
        onSort={handleSort}
        // getSortParams 유틸리티를 사용하여 정렬 상태 객체를 생성합니다.
        sort={getSortParams(params)}
        onAdd={() => navigate(faqAddUrl())}
        // onNextPage, onPreviousPage는 Context를 통해 전달됩니다.
      />
    </PaginatorContext.Provider>
  );
};

export default FaqList;