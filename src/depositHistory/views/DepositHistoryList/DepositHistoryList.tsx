// @ts-strict-ignore
import { useApolloClient } from "@apollo/client";
import { DepositHistoryListPage } from "@dashboard/depositHistory/components/DepositHistoryListPage";
import { DepositHistoryListUrlQueryParams } from "@dashboard/depositHistory/urls";
import {
  ListAllDepositHistoriesDocument,
  ListAllDepositHistoriesQuery,
  ListAllDepositHistoriesQueryVariables,
  useListAllDepositHistoriesQuery,
} from "@dashboard/graphql";
import useListSettings from "@dashboard/hooks/useListSettings";
import useNotifier from "@dashboard/hooks/useNotifier";
import usePaginator, {
  createPaginationState,
  PaginatorContext,
} from "@dashboard/hooks/usePaginator";
import { ListViews } from "@dashboard/types";
import { mapEdgesToItems } from "@dashboard/utils/maps";
import React, { useMemo, useRef, useState } from "react";
import { CSVLink } from "react-csv";

import { getFilterVariables } from "./filters";

interface DepositHistoryListProps {
  params: DepositHistoryListUrlQueryParams;
}

export const DepositHistoryList: React.FC<DepositHistoryListProps> = ({
  params,
}) => {
  const notify = useNotifier();
  // [주의] types.ts의 ListViews Enum에 DEPOSIT_HISTORY_LIST를 추가해야 합니다.
  const { updateListSettings, settings } = useListSettings(
    ListViews.DEPOSIT_HISTORY_LIST,
  );

  // 1. URL 파라미터 파싱
  const paginationState = createPaginationState(settings.rowNumber, params);

  const filterVariables = useMemo(() => getFilterVariables(params), [params]);

  // 2. 필터 변수 생성
  const queryVariables = useMemo<ListAllDepositHistoriesQueryVariables>(
    () => ({
      ...paginationState,
      filter: filterVariables,
    }),
    [paginationState, filterVariables],
  );

  // 3. Generated Hook을 사용한 데이터 조회
  const { data, loading } = useListAllDepositHistoriesQuery({
    displayLoader: true,
    variables: queryVariables,
  });

  const paginationValues = usePaginator({
    pageInfo: data?.allDepositHistories?.pageInfo,
    paginationState,
    queryString: params,
  });

  // 4. 엑셀 다운로드 로직
  const client = useApolloClient();
  const [exportLoading, setExportLoading] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const csvLink = useRef<any>(null);

  const handleExport = async () => {
    setExportLoading(true);
    notify({ status: "info", text: "전체 예치금 내역을 다운로드 중입니다..." });

    let allEdges = [];
    let hasNextPage = true;
    let endCursor = null;

    try {
      while (hasNextPage) {
        // ✅ DepositDocument 사용
        const { data: exportData } = await client.query<
          ListAllDepositHistoriesQuery,
          ListAllDepositHistoriesQueryVariables
        >({
          query: ListAllDepositHistoriesDocument,
          variables: {
            ...queryVariables,
            after: endCursor,
            first: 100, // 청크 단위
          },
          fetchPolicy: "network-only",
        });

        if (exportData?.allDepositHistories?.edges) {
          allEdges = [...allEdges, ...exportData.allDepositHistories.edges];
          hasNextPage = exportData.allDepositHistories.pageInfo.hasNextPage;
          endCursor = exportData.allDepositHistories.pageInfo.endCursor;
        } else {
          hasNextPage = false;
        }
      }

      if (allEdges.length > 0) {
        // CSV 데이터 매핑
        const formattedData = allEdges.map(({ node }) => ({
          date: new Date(node.createdAt).toLocaleString("ko-KR"),
          hospital: node.user?.businessName || "-",
          email: node.user?.email || "-",
          type: node.amount > 0 ? "적립" : "차감",
          amount: node.amount,
          balance: node.balanceAfterTransaction,
          reason: node.reason,
          // [추가] 예치금 관련 상세 필드
          paymentMethod: node.paymentMethodName || "-",
          status: node.status || "-",
        }));

        setCsvData(formattedData);
        setTimeout(() => {
          if (csvLink.current?.link) {
            csvLink.current.link.click();
          }
          setCsvData([]);
        }, 0);
      } else {
        notify({ status: "error", text: "다운로드할 데이터가 없습니다." });
      }
    } catch (e) {
      console.error(e);
      notify({
        status: "error",
        text: "데이터 다운로드 중 오류가 발생했습니다.",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const csvHeaders = [
    { label: "일시", key: "date" },
    { label: "병원명", key: "hospital" },
    { label: "이메일", key: "email" },
    { label: "구분", key: "type" },
    { label: "금액", key: "amount" }, // points -> amount
    { label: "잔액", key: "balance" },
    { label: "결제수단", key: "paymentMethod" }, // 추가
    { label: "상태", key: "status" }, // 추가
    { label: "사유", key: "reason" },
  ];

  return (
    <PaginatorContext.Provider value={paginationValues}>
      <DepositHistoryListPage
        data={mapEdgesToItems(data?.allDepositHistories)}
        disabled={loading}
        settings={settings}
        onUpdateListSettings={updateListSettings}
        params={params}
        onExport={handleExport}
        exportLoading={exportLoading}
      />
      {csvData.length > 0 && (
        <CSVLink
          data={csvData}
          headers={csvHeaders}
          filename={`deposit_history_${new Date().toISOString().slice(0, 10)}.csv`}
          ref={csvLink}
          target="_blank"
        />
      )}
    </PaginatorContext.Provider>
  );
};

export default DepositHistoryList;