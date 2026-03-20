// @ts-strict-ignore
import { AgencyTransferStatusEnum, useAgencyTransferListQuery } from "@dashboard/graphql";
import useListSettings from "@dashboard/hooks/useListSettings";
import useNavigator from "@dashboard/hooks/useNavigator";
import { usePaginationReset } from "@dashboard/hooks/usePaginationReset";
// ✅ PaginatorContext와 usePaginator를 추가로 import 합니다.
import usePaginator, {
  createPaginationState,
  PaginatorContext,
} from "@dashboard/hooks/usePaginator";
import { ListViews } from "@dashboard/types";
import { mapEdgesToItems } from "@dashboard/utils/maps";
import React from "react";
import { useIntl } from "react-intl";

import AgencyTransferListPage from "../components/AgencyTransferListPage";
import {
  agencyTransferDetailsUrl,
  AgencyTransferListUrlQueryParams,
  pendingAgencyTransfersUrl,
} from "../urls";

interface AgencyTransferListProps {
  params: AgencyTransferListUrlQueryParams;
  defaultStatusFilter: AgencyTransferStatusEnum[];
  pageTitle: string;
  listUrl?: (params?: AgencyTransferListUrlQueryParams) => string;
}

export const AgencyTransferList: React.FC<AgencyTransferListProps> = ({
  params,
  defaultStatusFilter,
  pageTitle,
  listUrl = pendingAgencyTransfersUrl,
}) => {
  const navigate = useNavigator();
  const intl = useIntl();

  const { updateListSettings, settings } = useListSettings<ListViews.AGENCY_TRANSFER_LIST>(
    ListViews.AGENCY_TRANSFER_LIST,
  );

  usePaginationReset(listUrl, params, settings.rowNumber);

  const paginationState = createPaginationState(settings.rowNumber, params);

  const queryVariables = React.useMemo(
    () => ({
      ...paginationState,
      filter: {
        status: defaultStatusFilter,
      },
    }),
    [paginationState, defaultStatusFilter],
  );

  const { data, loading } = useAgencyTransferListQuery({
    displayLoader: true,
    variables: queryVariables,
  });

  // ✅ 페이지네이션 로직 추가
  // 데이터에서 pageInfo를 추출하여 usePaginator에 전달합니다.
  const paginationValues = usePaginator({
    pageInfo: data?.agencyTransfers?.pageInfo,
    paginationState,
    queryString: params,
  });

  const transfers = mapEdgesToItems(data?.agencyTransfers);

  const handleRowClick = (id: string) => {
    navigate(agencyTransferDetailsUrl(id));
  };

  return (
    // ✅ PaginatorContext.Provider로 하위 컴포넌트를 감싸줍니다.
    // 이것이 있어야 하위의 TablePaginationWithContext가 정상 작동합니다.
    <PaginatorContext.Provider value={paginationValues}>
      <AgencyTransferListPage
        transfers={transfers}
        disabled={loading}
        settings={settings}
        onUpdateListSettings={updateListSettings}
        pageTitle={pageTitle}
        onRowClick={handleRowClick}
      />
    </PaginatorContext.Provider>
  );
};

export default AgencyTransferList;
