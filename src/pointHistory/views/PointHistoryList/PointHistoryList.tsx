// @ts-strict-ignore
import { useApolloClient } from "@apollo/client";
import { 
  ListAllPointHistoriesDocument,
  ListAllPointHistoriesQuery,
  ListAllPointHistoriesQueryVariables,
  useListAllPointHistoriesQuery
} from "@dashboard/graphql";
import useListSettings from "@dashboard/hooks/useListSettings";
import useNotifier from "@dashboard/hooks/useNotifier";
import usePaginator, { createPaginationState, PaginatorContext } from "@dashboard/hooks/usePaginator";
import { PointHistoryListPage } from "@dashboard/pointHistory/components/PointHistoryListPage";
import { PointHistoryListUrlQueryParams } from "@dashboard/pointHistory/urls";
import { ListViews } from "@dashboard/types";
import { mapEdgesToItems } from "@dashboard/utils/maps";
import React, { useMemo,useRef, useState } from "react";
import { CSVLink } from "react-csv";

import { getFilterVariables } from "./filters";

interface PointHistoryListProps {
  params: PointHistoryListUrlQueryParams;
}


export const PointHistoryList: React.FC<PointHistoryListProps> = ({ params }) => {
  const notify = useNotifier();
  const { updateListSettings, settings } = useListSettings(ListViews.POINT_HISTORY_LIST);

  // 1. URL 파라미터 파싱
  const paginationState = createPaginationState(settings.rowNumber, params);


  const filterVariables = useMemo(
    () => getFilterVariables(params),
    [params]
  );

  // 2. 필터 변수 생성 (OrderList 방식)
  const queryVariables = useMemo<ListAllPointHistoriesQueryVariables>(() => ({
    ...paginationState,
    filter: filterVariables,
  }), [paginationState, filterVariables]);

  // 3. Generated Hook을 사용한 데이터 조회
  const { data, loading } = useListAllPointHistoriesQuery({
    displayLoader: true,
    variables: queryVariables,
  });

  const paginationValues = usePaginator({
    pageInfo: data?.allPointHistories?.pageInfo,
    paginationState,
    queryString: params,
  });

  // 4. 엑셀 다운로드 로직 (OrderList의 while loop 방식 그대로 적용)
  const client = useApolloClient();
  const [exportLoading, setExportLoading] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const csvLink = useRef<any>(null);

  const handleExport = async () => {
    setExportLoading(true);
    notify({ status: "info", text: "전체 내역을 다운로드 중입니다..." });

    let allEdges = [];
    let hasNextPage = true;
    let endCursor = null;

    try {
      while (hasNextPage) {
        // ✅ client.query에 Generated Type 적용
        const { data: exportData } = await client.query<ListAllPointHistoriesQuery, ListAllPointHistoriesQueryVariables>({
          query: ListAllPointHistoriesDocument, // Generated Document
          variables: {
            ...queryVariables,
            after: endCursor,
            first: 100, // 청크 단위
          },
          fetchPolicy: "network-only",
        });

        if (exportData?.allPointHistories?.edges) {
          allEdges = [...allEdges, ...exportData.allPointHistories.edges];
          hasNextPage = exportData.allPointHistories.pageInfo.hasNextPage;
          endCursor = exportData.allPointHistories.pageInfo.endCursor;
        } else {
          hasNextPage = false;
        }
      }

      if (allEdges.length > 0) {
        // CSV 데이터 매핑
        const formattedData = allEdges.map(({ node }) => ({
          date: new Date(node.createdAt).toLocaleString("ko-KR"),
          hospital: node.user?.businessName || "-", // ✅ 병원명(businessName) 사용
          email: node.user?.email || "-",
          type: node.points > 0 ? "적립" : "사용",
          points: node.points,
          reason: node.reason,
          balance: node.balanceAfterTransaction 
        }));

        setCsvData(formattedData);
        // 비동기 렌더링 후 클릭 트리거
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
      notify({ status: "error", text: "데이터 다운로드 중 오류가 발생했습니다." });
    } finally {
      setExportLoading(false);
    }
  };

  const csvHeaders = [
    { label: "일시", key: "date" },
    { label: "병원명", key: "hospital" },
    { label: "이메일", key: "email" },
    { label: "구분", key: "type" },
    { label: "포인트", key: "points" },
    { label: "잔액", key: "balance" },
    { label: "사유", key: "reason" },
  ];

  return (
    <PaginatorContext.Provider value={paginationValues}>
      <PointHistoryListPage
        data={mapEdgesToItems(data?.allPointHistories)}
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
          filename={`point_history_${new Date().toISOString().slice(0, 10)}.csv`}
          ref={csvLink}
          target="_blank"
        />
      )}
    </PaginatorContext.Provider>
  );
};

export default PointHistoryList;