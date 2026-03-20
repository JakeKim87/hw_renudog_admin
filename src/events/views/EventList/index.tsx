// src/events/views/EventList/index.tsx

import { EventSortField, OrderDirection, useEventsQuery } from "@dashboard/graphql";
import useListSettings from "@dashboard/hooks/useListSettings";
import useNavigator from "@dashboard/hooks/useNavigator";
import usePaginator, { createPaginationState, PaginatorContext } from "@dashboard/hooks/usePaginator";
import { ListViews } from "@dashboard/types";
import createSortHandler from "@dashboard/utils/handlers/sortHandler";
import { mapEdgesToItems } from "@dashboard/utils/maps";
import { getSortParams } from "@dashboard/utils/sort";
import React from "react";

import EventListPage from "../../components/EventListPage";
import { eventAddUrl, eventListUrl, EventListUrlQueryParams, EventListUrlSortField, eventUrl } from "../../urls";

const getSortByField = (sort: EventListUrlSortField | undefined): EventSortField | undefined => {
  if (!sort) return undefined;
  if (sort === EventListUrlSortField.startDate) return EventSortField.START_DATE;
  return undefined;
};

export const EventList: React.FC<{ params: EventListUrlQueryParams }> = ({ params }) => {
  const navigate = useNavigator();
  const { updateListSettings, settings } = useListSettings(ListViews.EVENT_LIST);
  const paginationState = createPaginationState(settings.rowNumber, params);

  const queryVariables = React.useMemo(() => ({
    ...paginationState,
    sortBy: params.sort ? {
        direction: params.asc ? OrderDirection.ASC : OrderDirection.DESC,
        field: getSortByField(params.sort),
      } : undefined,
  }), [params, paginationState]);

  const { data, loading } = useEventsQuery({ displayLoader: true, variables: queryVariables });
  const paginationValues = usePaginator({ pageInfo: data?.events?.pageInfo, paginationState, queryString: params });
  const events = mapEdgesToItems(data?.events);
  const handleSort = createSortHandler(navigate, eventListUrl, params);

  return (
    <PaginatorContext.Provider value={paginationValues}>
      <EventListPage events={events} settings={settings} disabled={loading} onUpdateListSettings={updateListSettings} onRowClick={id => navigate(eventUrl(id))} onSort={handleSort} sort={getSortParams(params)} onAdd={() => navigate(eventAddUrl())} />
    </PaginatorContext.Provider>
  );
};

export default EventList;