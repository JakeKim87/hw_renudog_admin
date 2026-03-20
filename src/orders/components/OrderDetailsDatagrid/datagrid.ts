// @ts-strict-ignore
import {
  booleanCell,
  buttonCell,
  loadingCell,
  moneyCell,
  readonlyTextCell,
  thumbnailCell,
} from "@dashboard/components/Datagrid/customCells/cells";
import { GetCellContentOpts } from "@dashboard/components/Datagrid/Datagrid";
import { AvailableColumn } from "@dashboard/components/Datagrid/types";
import { OrderLineFragment, OrderStatus } from "@dashboard/graphql";
import { getDatagridRowDataIndex } from "@dashboard/misc";
import { GridCell, Item } from "@glideapps/glide-data-grid";
import { IntlShape } from "react-intl";

import { columnsMessages } from "./messages";

export const orderDetailsStaticColumnsAdapter = (intl: IntlShape): AvailableColumn[] => [
  {
    id: "product",
    title: intl.formatMessage(columnsMessages.product),
    width: 300,
  },
  {
    id: "sku",
    title: intl.formatMessage(columnsMessages.sku),
    width: 150,
  },
  {
    id: "variantName",
    title: intl.formatMessage(columnsMessages.variantName),
    width: 150,
  },
  {
    id: "quantity",
    title: intl.formatMessage(columnsMessages.quantity),
    width: 80,
  },
  {
    id: "additionalOptions",
    title: "추가옵션",
    width: 150,
  },
  {
    id: "price",
    title: intl.formatMessage(columnsMessages.price),
    width: 150,
  },
  {
    id: "total",
    title: intl.formatMessage(columnsMessages.total),
    width: 150,
  },
  {
    id: "exchange",
    title: "교환",
    width: 100,
  },
  {
    id: "cancel",
    title: "취소",
    width: 100,
  },
];

interface GetCellContentProps {
  columns: AvailableColumn[];
  data: OrderLineFragment[];
  loading: boolean;
  onCancelLine: (line: OrderLineFragment) => void;
  orderStatus?: OrderStatus;
  onExchangeLine: (line: OrderLineFragment) => void;
}

export const createGetCellContent =
  ({ columns, data, loading, onCancelLine, orderStatus, onExchangeLine }: GetCellContentProps) =>
  ([column, row]: Item, { added, removed }: GetCellContentOpts): GridCell => {
    if (loading) {
      return loadingCell();
    }

    const columnId = columns[column]?.id;
    const rowData = added.includes(row) ? undefined : data[getDatagridRowDataIndex(row, removed)];

    if (!rowData || !columnId) {
      return readonlyTextCell("", false);
    }

    switch (columnId) {
      case "product":
        return thumbnailCell(
          rowData?.productName ?? "",
          rowData.thumbnail?.url ?? "",
          readonyOptions,
        );
      case "sku":
        return readonlyTextCell(rowData.productSku ?? "", false);
      case "variantName":
        return readonlyTextCell(rowData?.variant?.name ?? "-", false);
      case "quantity":
        return readonlyTextCell(rowData.quantity.toString(), false);
      case "additionalOptions": {
        const optionTexts: string[] = [];

        // rowData.metadata는 [{ key, value }] 형태의 배열입니다.
        if (Array.isArray(rowData.metadata)) {
          // 'patientChart' 키가 있는지 확인
          if (rowData.metadata.some(meta => meta.key === "patientChart" && meta.value === "true")) {
            optionTexts.push("환자차트");
          }
          // 'warrantyForm' 키가 있는지 확인
          if (rowData.metadata.some(meta => meta.key === "warrantyForm" && meta.value === "true")) {
            optionTexts.push("워런티 용지");
          }
          if (
            rowData.metadata.some(
              meta => meta.key === "sizeChartA4Consulting" && meta.value === "true",
            )
          ) {
            optionTexts.push("사이즈 차트 (상담용 A4)");
          }
          if (
            rowData.metadata.some(
              meta => meta.key === "sizeChartA3Surgical" && meta.value === "true",
            )
          ) {
            optionTexts.push("사이즈 차트 (수술실용 A3)");
          }
          if (
            rowData.metadata.some(
              meta => meta.key === "externalSizingKitChartA4" && meta.value === "true",
            )
          ) {
            optionTexts.push("익스터널 사이징 키트 차트 (A4)");
          }
          if (
            rowData.metadata.some(meta => meta.key === "preserveChartA4" && meta.value === "true")
          ) {
            optionTexts.push("프리저베 사이즈 차트 (A4)");
          }
        }

        // 표시할 텍스트가 있으면 쉼표로 연결, 없으면 '-' 표시
        const displayValue = optionTexts.length > 0 ? optionTexts.join(", ") : "-";

        return readonlyTextCell(displayValue, false);
      }
      case "price":
        return moneyCell(
          rowData.unitPrice.gross.amount,
          rowData.unitPrice.gross.currency,
          readonyOptions,
        );

      case "total":
        return moneyCell(
          rowData.totalPrice.gross.amount,
          rowData.totalPrice.gross.currency,
          readonyOptions,
        );
      case "exchange":
        // 취소된 주문이거나 이미 배송된 경우 등 조건에 따라 버튼 숨김 처리 가능
        if (orderStatus === OrderStatus.CANCELED) {
          return readonlyTextCell("-", false);
        }
        return buttonCell("교환", () => {
          if (rowData) {
            onExchangeLine(rowData);
          }
        });

      case "cancel":
        // 3. 주문 상태가 CANCELED인 경우 빈 텍스트 셀 반환 (버튼 숨김)
        if (orderStatus === OrderStatus.CANCELED) {
          return readonlyTextCell("-", false); // 또는 "" 빈 문자열
        }

        return buttonCell("취소", () => {
          if (rowData) {
            onCancelLine(rowData);
          }
        });

      default:
        return readonlyTextCell("", false);
    }
  };

const readonyOptions: Partial<GridCell> = {
  allowOverlay: false,
  readonly: true,
};
