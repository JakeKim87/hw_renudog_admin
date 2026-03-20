// src/inventory/views/InventoryList.tsx

import { useMutation } from "@apollo/client";
import { OnDatagridChange } from "@dashboard/components/Datagrid/hooks/useDatagridChange";
import { StockFilterInput, useProductVariantStocksUpdateMutation, useWarehouseStockListQuery } from "@dashboard/graphql";
import useListSettings from "@dashboard/hooks/useListSettings";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import usePaginator, { createPaginationState, PaginatorContext } from "@dashboard/hooks/usePaginator";
import { ListViews } from "@dashboard/types";
import { mapEdgesToItems } from "@dashboard/utils/maps";
import { inventoryListUrl, InventoryListUrlQueryParams } from "@dashboard/warehouses/urls";
import { GridCell, GridCellKind } from "@glideapps/glide-data-grid";
import React, { useState } from "react";

import InventoryListPage from "../components/InventoryListPage";
import { uploadStock } from "../mutations";

interface InventoryListProps {
  params: InventoryListUrlQueryParams;
}


// URL 파라미터를 GraphQL 필터 변수로 변환하는 함수
const getFilterVariables = (params: InventoryListProps["params"]) => {
  const filter: StockFilterInput = {};

  if (params.warehouse) {
    filter.warehouse = [params.warehouse];
  }
  
  if (params.search) {
    // 백엔드 스키마에 search 필터가 있어야 합니다.
    // 없다면 productVariant_name 또는 productVariant_sku 로 필터링해야 합니다.
    filter.search = params.search;
  }

  return filter;
};

const InventoryList: React.FC<InventoryListProps> = ({ params }) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const { settings, updateListSettings } = useListSettings(ListViews.STOCK_LIST);
  const paginationState = createPaginationState(settings.rowNumber, params);
  const filterVariables = getFilterVariables(params);

  const queryVariables = React.useMemo(() => ({
    ...paginationState,
    filter: filterVariables,
  }), [paginationState, filterVariables]);

  const { data, loading, refetch } = useWarehouseStockListQuery({
    variables: queryVariables,
  });

  const [changes, setChanges] = useState<Map<number, GridCell>>(new Map());
  const [updateStocks, updateStocksOpts] = useProductVariantStocksUpdateMutation();

  const paginationValues = usePaginator({
    pageInfo: data?.stocks?.pageInfo,
    paginationState,
    queryString: params,
  });
  
  // 필터 값 변경 시 URL을 즉시 바꾸지 않고, '조회' 버튼을 눌렀을 때만 변경합니다.
  const handleFilterChange = (key: string, value: string) => {
      navigate(inventoryListUrl({ ...params, [key]: value }), { replace: true });
  };
  
  const handleFilterSubmit = () => {
      navigate(inventoryListUrl({ ...params, ...paginationState, before: undefined, after: undefined }));
  };

  const handleDatagridChange: OnDatagridChange = (opts) => {
    const currentUpdate = opts.currentUpdate;

    if (!currentUpdate) {
      return;
    }
    
    const row = currentUpdate.row;
    const cell: GridCell = {
        kind: GridCellKind.Number, // 우리는 숫자 셀만 편집하므로 가정할 수 있습니다.
        data: currentUpdate.data,
        allowOverlay: true,
        displayData: String(currentUpdate.data),
    };

    setChanges(prev => {
      const newChanges = new Map(prev);

      newChanges.set(row, cell);

      return newChanges;
    });
  };

  const [uploadStockMutation, { loading: uploadLoading }] = useMutation(uploadStock, {
    onCompleted: (data) => {
      const result = data.productVariantStocksExcelUpdate;
      const failedCount = result.failedSkus.length;
      const successCount = result.updatedCount;

      if (failedCount > 0) {
        notify({
          status: "warning",
          text: `완료: ${successCount}개 업데이트. 실패(SKU 없음): ${failedCount}개`,
        });
        console.warn("Failed SKUs:", result.failedSkus);
      } else {
        notify({
          status: "success",
          text: `성공적으로 ${successCount}개의 재고를 업데이트했습니다.`,
        });
      }
      refetch(); // 데이터 갱신
    },
    onError: (error) => {
      notify({
        status: "error",
        text: `업로드 실패: ${error.message}`,
      });
    },
  });

  // ✅ [추가] 파일 선택 시 호출될 핸들러
  const handleFileUpload = (file: File) => {
    notify({ status: "info", text: "파일을 업로드하고 처리 중입니다..." });
    uploadStockMutation({ variables: { file } });
  };

  const handleSaveChanges = async () => {
    const stocks = mapEdgesToItems(data?.stocks);

    if (!stocks || changes.size === 0) return;

    notify({ status: "info", text: "변경 사항을 저장 중입니다..." });

    const changesByVariantId = new Map<string, { warehouseId: string; newQuantity: number }[]>();

    // 💡 `changes` Map을 순회하면서 변경된 내용을 그룹화합니다.
    for (const [row, changedCell] of changes.entries()) {
      const stockToUpdate = stocks[row];
      const variantId = stockToUpdate.productVariant.id;

      // 💡 `changedCell`의 타입을 확인하여 안전하게 값을 추출합니다.
      // NumberCell의 경우, 수정된 값은 `data` 속성에 들어 있습니다.
      // 이 로직은 datagrid.ts에서 NumberCell을 반환하기 때문에 유효합니다.
      if (changedCell.kind === GridCellKind.Number) {
        if (!changesByVariantId.has(variantId)) {
          changesByVariantId.set(variantId, []);
        }

        changesByVariantId.get(variantId)!.push({
          warehouseId: stockToUpdate.warehouse.id,
          newQuantity: changedCell.data,
        });
      }
    }

    const results = await Promise.all(
      Array.from(changesByVariantId.entries()).map(([variantId, stockChanges]) => {
        const allStocksForVariant = stocks.filter(s => s.productVariant.id === variantId);
        const mutationStocksInput = allStocksForVariant.map(s => {
          const change = stockChanges.find(c => c.warehouseId === s.warehouse.id);

          return {
            warehouse: s.warehouse.id,
            quantity: change ? change.newQuantity : s.quantity,
          };
        });

        return updateStocks({ variables: { variantId, stocks: mutationStocksInput } });
      }),
    );

    const errors = results.filter(result => result.data?.productVariantStocksUpdate?.bulkStockErrors?.length > 0);

    if (errors.length > 0) {
      notify({ status: "error", text: "오류: 일부 항목 저장에 실패했습니다." });
    } else {
      notify({ status: "success", text: "변경 사항이 저장되었습니다." });
    }

    setChanges(new Map());
    refetch();
  };
  
  // ✅ 6. Savebar의 취소 버튼을 위한 핸들러
  const handleCancelChanges = () => {
    setChanges(new Map());
  };


  return (
    <PaginatorContext.Provider value={paginationValues}>
      <InventoryListPage
        stocks={mapEdgesToItems(data?.stocks)}
        settings={settings}
        disabled={loading}
        onUpdateListSettings={updateListSettings}
        params={params}
        onFilterChange={handleFilterChange}
        onFilterSubmit={handleFilterSubmit}
        changes={changes}
        onChange={handleDatagridChange}
        onSave={handleSaveChanges}
        onCancel={handleCancelChanges}
        saveButtonState={updateStocksOpts.loading ? "loading" : "default"}
        onFileUpload={handleFileUpload}
        isUploading={uploadLoading}
      />
    </PaginatorContext.Provider>
  );
};

export default InventoryList;