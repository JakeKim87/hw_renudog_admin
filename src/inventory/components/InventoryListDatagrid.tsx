// src/inventory/components/InventoryListDatagrid.tsx

import { useColumns } from "@dashboard/components/Datagrid/ColumnPicker/useColumns";
import Datagrid from "@dashboard/components/Datagrid/Datagrid";
import {
  DatagridChangeStateContext,
  OnDatagridChange,
  useDatagridChangeState,
} from "@dashboard/components/Datagrid/hooks/useDatagridChange";
import { TablePaginationWithContext } from "@dashboard/components/TablePagination";
import { WarehouseStockListQuery } from "@dashboard/graphql";
import { ListProps, RelayToFlat } from "@dashboard/types";
import { GridCell } from "@glideapps/glide-data-grid";
import { Box } from "@saleor/macaw-ui-next";
import React, { useMemo } from "react";

import { createGetCellContent, inventoryListStaticColumnsAdapter } from "../datagrid";

interface InventoryListDatagridProps extends ListProps {
  stocks: RelayToFlat<WarehouseStockListQuery["stocks"]>;
  changes: Map<number, GridCell>;
  onChange: OnDatagridChange;
}

export const InventoryListDatagrid: React.FC<InventoryListDatagridProps> = ({
  stocks,
  settings,
  disabled,
  onUpdateListSettings,
  changes,
  onChange,
}) => {
  const datagridState = useDatagridChangeState();

  const memoizedStaticColumns = useMemo(
    () => inventoryListStaticColumnsAdapter(null), // sort 대신 null 전달
    [],
  );

  const { handlers, visibleColumns } = useColumns({
    gridName: "inventory_list",
    staticColumns: memoizedStaticColumns,
    selectedColumns: settings?.columns ?? [],
    onSave: cols => onUpdateListSettings("columns", cols),
  });

  const getCellContent = useMemo(
    () => createGetCellContent({ stocks, columns: visibleColumns, changes }),
    [stocks, visibleColumns, changes],
  );


  return (
    <DatagridChangeStateContext.Provider value={datagridState}>
      <Datagrid
        // ✅ 5. `readonly`를 false로 변경하여 편집을 활성화합니다.
        readonly={false}
        loading={disabled}
        rows={stocks?.length ?? 0}
        availableColumns={visibleColumns}
        getCellContent={getCellContent}
        emptyText="재고 정보가 없습니다."
        onColumnResize={handlers.onResize}
        onColumnMoved={handlers.onMove}
        onChange={onChange}
        getCellError={() => false} // 에러가 없다고 가정하므로 항상 false를 반환
        menuItems={() => []} // 행별 메뉴가 없으므로 빈 배열을 반환
        selectionActions={() => null} // 선택 시 액션이 없으므로 null을 반환
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