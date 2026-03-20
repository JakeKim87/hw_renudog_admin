// src/events/views/EventSubmissionList/index.tsx

import { EventSubmissionFilterInput, EventSubmissionSortField, OrderDirection, useEventSubmissionsQuery } from "@dashboard/graphql";
import useListSettings from "@dashboard/hooks/useListSettings";
import useNavigator from "@dashboard/hooks/useNavigator";
import usePaginator, { createPaginationState, PaginatorContext } from "@dashboard/hooks/usePaginator";
import { ListViews } from "@dashboard/types";
import createSortHandler from "@dashboard/utils/handlers/sortHandler";
import { mapEdgesToItems } from "@dashboard/utils/maps";
import { getSortParams } from "@dashboard/utils/sort";
import React from "react";

import EventSubmissionListPage from "../../components/EventSubmissionListPage";
import { eventSubmissionListUrl, EventSubmissionListUrlQueryParams, EventSubmissionListUrlSortField,eventSubmissionUrl } from "../../urls";

// URL 파라미터(camelCase)를 GraphQL Enum(UPPER_SNAKE_CASE)으로 변환
const getSortByField = (sort: EventSubmissionListUrlSortField | undefined): EventSubmissionSortField | undefined => {
  if (sort === EventSubmissionListUrlSortField.submittedAt) return EventSubmissionSortField.SUBMITTED_AT;
  return undefined;
};

// URL 파라미터를 GraphQL Filter Input 객체로 변환
const getFilterVariables = (params: EventSubmissionListUrlQueryParams): EventSubmissionFilterInput => {
    return {
        search: params.search,
        status: params.status,
        event: params.event,
    }
}

export const EventSubmissionList: React.FC<{ params: EventSubmissionListUrlQueryParams }> = ({ params }) => {
  const navigate = useNavigator();
  const { updateListSettings, settings } = useListSettings(ListViews.EVENT_SUBMISSION_LIST);
  const paginationState = createPaginationState(settings.rowNumber, params);

  const queryVariables = React.useMemo(() => ({
    ...paginationState,
    filter: getFilterVariables(params),
    sortBy: params.sort ? {
        direction: params.asc ? OrderDirection.ASC : OrderDirection.DESC,
        field: getSortByField(params.sort),
      } : undefined,
  }), [params, paginationState]);

  const { data, loading } = useEventSubmissionsQuery({ displayLoader: true, variables: queryVariables });
  const paginationValues = usePaginator({ pageInfo: data?.eventSubmissions?.pageInfo, paginationState, queryString: params });
  const submissions = mapEdgesToItems(data?.eventSubmissions);
  const handleSort = createSortHandler(navigate, eventSubmissionListUrl, params);

  const handleFilterChange = (filters: { status?: string }) => {
    navigate(
      eventSubmissionListUrl({
        ...params, // 기존 파라미터(정렬 등) 유지
        ...filters, // 새로운 필터 값 적용
        // 필터 변경 시 첫 페이지로 리셋
        after: undefined,
        before: undefined,
      })
    );
  };

  const filterValues = {
    status: params.status
  };


  return (
    <PaginatorContext.Provider value={paginationValues}>
      <EventSubmissionListPage
        submissions={submissions}
        settings={settings}
        disabled={loading}
        onUpdateListSettings={updateListSettings}
        onRowClick={id => navigate(eventSubmissionUrl(id))}
        onSort={handleSort}
        sort={getSortParams(params)}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
      />
    </PaginatorContext.Provider>
  );
};

export default EventSubmissionList;