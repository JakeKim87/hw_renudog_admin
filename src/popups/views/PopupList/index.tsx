// src/popups/views/PopupList/index.tsx

import {
  OrderDirection,
  PopupSortField,
  usePopupsQuery,
} from "@dashboard/graphql";
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

import PopupListPage from "../../components/PopupListPage";
import {
  popupAddUrl,
  popupListUrl,
  PopupListUrlQueryParams,
  PopupListUrlSortField,
  popupUrl,
} from "../../urls";

interface PopupListProps {
  params: PopupListUrlQueryParams;
}

// URL 파라미터를 GraphQL Enum으로 변환하는 헬퍼 함수
const getSortByField = (sort: PopupListUrlSortField | undefined): PopupSortField | undefined => {
  if (!sort) {
    return undefined;
  }

  switch (sort) {
    case PopupListUrlSortField.title:
      return PopupSortField.TITLE;
    case PopupListUrlSortField.createdAt:
      return PopupSortField.CREATEDAT;
    default:
      return undefined;
  }
};


export const PopupList: React.FC<PopupListProps> = ({ params }) => {
  const navigate = useNavigator();
  const { updateListSettings, settings } = useListSettings(ListViews.POPUP_LIST);
  const paginationState = createPaginationState(settings.rowNumber, params);

  const queryVariables = React.useMemo(
    () => ({
      ...paginationState,
      // --- 이 부분을 수정합니다 ---
      sortBy: params.sort
        ? {
            direction: params.asc ? OrderDirection.ASC : OrderDirection.DESC,
            field: getSortByField(params.sort), // 헬퍼 함수를 사용해 변환
          }
        : undefined,
    }),
    [params, paginationState],
  );

  const { data, loading } = usePopupsQuery({
    displayLoader: true,
    variables: queryVariables,
  });

  const paginationValues = usePaginator({
    pageInfo: data?.popups?.pageInfo,
    paginationState,
    queryString: params,
  });

  const popups = mapEdgesToItems(data?.popups);
  const handleSort = createSortHandler(navigate, popupListUrl, params);

  return (
    <PaginatorContext.Provider value={paginationValues}>
      <PopupListPage
        popups={popups}
        settings={settings}
        disabled={loading}
        onUpdateListSettings={updateListSettings}
        onRowClick={id => navigate(popupUrl(id))}
        onSort={handleSort}
        sort={getSortParams(params)}
        onAdd={() => navigate(popupAddUrl())}
      />
    </PaginatorContext.Provider>
  );
};

export default PopupList;