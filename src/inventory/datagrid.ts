// src/inventory/datagrid.ts

import { GetCellContentOpts } from "@dashboard/components/Datagrid/Datagrid";
import { AvailableColumn } from "@dashboard/components/Datagrid/types";
import { WarehouseStockListQuery } from "@dashboard/graphql";
import { RelayToFlat } from "@dashboard/types";
import { GridCell, GridCellKind } from "@glideapps/glide-data-grid";

// 1. 데이터그리드에 표시할 컬럼들을 정의합니다.
export const inventoryListStaticColumnsAdapter = (
  sort: any,
): AvailableColumn[] => [
  {
    id: "product",
    title: "상품명",
    width: 300,
  },
  {
    id: "sku",
    title: "SKU",
    width: 200,
  },
  {
    id: "warehouse", // ✅ 창고 컬럼을 추가하는 것이 좋습니다.
    title: "창고",
    width: 200,
  },
  {
    id: "quantity",
    title: "현재고",
    width: 150,
  },
  {
    id: "available",
    title: "가용 재고",
    width: 150,
  },
];

// 2. 각 셀에 어떤 데이터를 채울지 정의하는 함수를 만듭니다.
export const createGetCellContent =
  ({
    stocks,
    columns,
    changes, // ✅ 2-A. 임시 변경 사항을 props로 받습니다.
  }: {
    stocks: RelayToFlat<WarehouseStockListQuery["stocks"]>;
    columns: AvailableColumn[];
    changes: Map<number, GridCell>; // ✅ 2-B. changes의 타입을 명시합니다.
  }) =>
  ([col, row]: [number, number], _opts: GetCellContentOpts): GridCell => {
    const change = changes.get(row);
    const columnId = columns[col].id;

    if (change && columnId === 'quantity') {
      return change;
    }

    const stock = stocks[row];
    

    const emptyCell: GridCell = {
      kind: GridCellKind.Text,
      data: "",
      allowOverlay: false,
      displayData: "",
    };

    if (!stock) {
      return emptyCell;
    }

    // ✅ 2-E. 각 셀이 기본적으로 '읽기 전용'이 되도록 설정하고, 필요한 셀만 편집 가능하게 만듭니다.
    switch (columnId) {
      case "product": {
        const productName = stock.productVariant?.product.name || "-";

        return {
          kind: GridCellKind.Text,
          data: productName,
          displayData: productName,
          allowOverlay: true,
          readonly: true, // 읽기 전용
        };
      }
      case "sku": {
        const sku = stock.productVariant?.sku || "-";

        return {
          kind: GridCellKind.Text,
          data: sku,
          displayData: sku,
          allowOverlay: true,
          readonly: true, // 읽기 전용
        };
      }
      case "warehouse": { // ✅ 창고 셀 추가
          return {
              kind: GridCellKind.Text,
              data: stock.warehouse.name,
              displayData: stock.warehouse.name,
              allowOverlay: true,
              readonly: true, // 읽기 전용
          };
      }
      case "quantity": {
        return {
          kind: GridCellKind.Number,
          data: stock.quantity,
          displayData: stock.quantity.toString(),
          allowOverlay: true,
          readonly: false, // 💥 이 셀만 편집 가능하도록 설정
        };
      }
      case "available": {
        const changedQuantityCell = changes.get(row);
        
        // 2. 변경되었다면 새로운 quantity 값을, 아니면 원래 값을 사용합니다.
        const currentQuantity =
          changedQuantityCell && changedQuantityCell.kind === GridCellKind.Number
            ? changedQuantityCell.data
            : stock.quantity;
            
        // 3. 올바른 '현재고' 값으로 '가용 재고'를 계산합니다.
        const availableStock = currentQuantity - stock.quantityAllocated;

        return {
          kind: GridCellKind.Number,
          data: availableStock,
          displayData: availableStock.toString(),
          allowOverlay: true,
          readonly: true,
        };
      }
      default:
        return { ...emptyCell, readonly: true };
    }
  };
