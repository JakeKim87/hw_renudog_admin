// @ts-strict-ignore
import { ColumnPicker } from "@dashboard/components/Datagrid/ColumnPicker/ColumnPicker";
import { useColumns } from "@dashboard/components/Datagrid/ColumnPicker/useColumns";
import Datagrid from "@dashboard/components/Datagrid/Datagrid";
import { DatagridChangeStateContext,useDatagridChangeState } from "@dashboard/components/Datagrid/hooks/useDatagridChange";
import { TablePaginationWithContext } from "@dashboard/components/TablePagination";
import { Box } from "@saleor/macaw-ui-next";
import React, { useCallback } from "react";

import { pointHistoryStaticColumns, useGetPointHistoryCellContent } from "./datagrid";

interface PointHistoryListDatagridProps {
  disabled: boolean;
  settings: any;
  onUpdateListSettings: any;
  data: any[]; 
}

export const PointHistoryListDatagrid: React.FC<PointHistoryListDatagridProps> = ({
  disabled,
  settings,
  onUpdateListSettings,
  data,
}) => {
  const datagrid = useDatagridChangeState();

  const handleColumnChange = useCallback(
    picked => {
      onUpdateListSettings("columns", picked.filter(Boolean));
    },
    [onUpdateListSettings],
  );

  const { handlers, visibleColumns, selectedColumns, staticColumns } = useColumns({
    gridName: "point_history_list",
    staticColumns: pointHistoryStaticColumns, // 위에서 정의한 병원명 컬럼 적용
    selectedColumns: settings?.columns ?? [],
    onSave: handleColumnChange,
  });

  const getCellContent = useGetPointHistoryCellContent({
    columns: visibleColumns,
    data,
  });

  return (
    <DatagridChangeStateContext.Provider value={datagrid}>
      <Datagrid
        readonly
        loading={disabled}
        columnSelect="single"
        freezeColumns={1}
        verticalBorder={false}
        availableColumns={visibleColumns}
        emptyText="조회된 포인트 내역이 없습니다."
        getCellContent={getCellContent}
        getCellError={() => false}
        menuItems={() => []}
        rows={data?.length ?? 0}
        selectionActions={() => null}
        onColumnResize={handlers.onResize}
        onColumnMoved={handlers.onMove}
        renderColumnPicker={() => (
          <ColumnPicker
            staticColumns={staticColumns}
            selectedColumns={selectedColumns}
            onToggle={handlers.onToggle}
          />
        )}
      />
      <Box paddingX={6}>
        <TablePaginationWithContext
          component="div"
          settings={settings}
          disabled={disabled}
          onUpdateListSettings={onUpdateListSettings}
        />
      </Box>
    </DatagridChangeStateContext.Provider>
  );
};