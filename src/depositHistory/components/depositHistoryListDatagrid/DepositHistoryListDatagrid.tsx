// @ts-strict-ignore
import { ColumnPicker } from "@dashboard/components/Datagrid/ColumnPicker/ColumnPicker";
import { useColumns } from "@dashboard/components/Datagrid/ColumnPicker/useColumns";
import Datagrid from "@dashboard/components/Datagrid/Datagrid";
import {
  DatagridChangeStateContext,
  useDatagridChangeState,
} from "@dashboard/components/Datagrid/hooks/useDatagridChange";
import { TablePaginationWithContext } from "@dashboard/components/TablePagination";
import { Box } from "@saleor/macaw-ui-next";
import React, { useCallback } from "react";

// [중요] datagrid.ts 파일에 아래 두 가지가 정의되어 있어야 합니다.
import {
  depositHistoryStaticColumns,
  useGetDepositHistoryCellContent,
} from "./datagrid";

interface DepositHistoryListDatagridProps {
  disabled: boolean;
  settings: any;
  onUpdateListSettings: any;
  data: any[];
}

export const DepositHistoryListDatagrid: React.FC<
  DepositHistoryListDatagridProps
> = ({ disabled, settings, onUpdateListSettings, data }) => {
  const datagrid = useDatagridChangeState();

  const handleColumnChange = useCallback(
    (picked) => {
      onUpdateListSettings("columns", picked.filter(Boolean));
    },
    [onUpdateListSettings],
  );

  const { handlers, visibleColumns, selectedColumns, staticColumns } = useColumns(
    {
      gridName: "deposit_history_list", // 그리드 설정 저장 키값 변경
      staticColumns: depositHistoryStaticColumns,
      selectedColumns: settings?.columns ?? [],
      onSave: handleColumnChange,
    },
  );

  const getCellContent = useGetDepositHistoryCellContent({
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
        emptyText="조회된 예치금 내역이 없습니다."
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