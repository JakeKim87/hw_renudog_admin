import { useNoticesQuery } from "@dashboard/graphql";
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

import NoticeListPage from "../../components/NoticeListPage";
import {
  noticeAddUrl,
  noticeListUrl,
  NoticeListUrlQueryParams,
  noticeUrl,
} from "../../urls";

interface NoticeListProps {
  params: NoticeListUrlQueryParams;
}

export const NoticeList: React.FC<NoticeListProps> = ({ params }) => {
  const navigate = useNavigator();
  const { updateListSettings, settings } = useListSettings(ListViews.NOTICE_LIST);

  // 1. 페이지네이션 상태를 생성합니다. (Faq와 동일)
  const paginationState = createPaginationState(settings.rowNumber, params);

  // 2. 쿼리 변수를 준비합니다. (Faq와 동일하게 useMemo 사용 및 filter/sortBy 주석 처리)
  const queryVariables = React.useMemo(
    () => ({
      ...paginationState,
      // filter: getNoticeFilterVariables(params), // Faq처럼 구현되지 않았으므로 주석 처리
      // sortBy: getNoticeSortQueryVariables(params), // Faq처럼 구현되지 않았으므로 주석 처리
    }),
    [params, settings.rowNumber],
  );

  // 3. 데이터를 가져옵니다. (Faq와 동일)
  const { data, loading } = useNoticesQuery({
    displayLoader: true,
    variables: queryVariables,
  });

  // 4. usePaginator 훅을 사용하여 페이지네이션 값을 계산합니다. (Faq와 동일)
  const paginationValues = usePaginator({
    pageInfo: data?.notices?.pageInfo,
    paginationState,
    queryString: params,
  });

  // 5. 나머지 핸들러들을 준비합니다. (Faq와 동일)
  const notices = mapEdgesToItems(data?.notices);
  const handleSort = createSortHandler(navigate, noticeListUrl, params);

  return (
    // 6. PaginatorContext.Provider로 하위 컴포넌트를 감쌉니다. (Faq와 동일)
    <PaginatorContext.Provider value={paginationValues}>
      <NoticeListPage
        notices={notices}
        settings={settings}
        disabled={loading}
        onUpdateListSettings={updateListSettings}
        onRowClick={id => navigate(noticeUrl(id))}
        onSort={handleSort}
        sort={getSortParams(params)}
        onAdd={() => navigate(noticeAddUrl())}
      />
    </PaginatorContext.Provider>
  );
};

export default NoticeList;