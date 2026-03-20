import { ColumnPicker } from "@dashboard/components/Datagrid/ColumnPicker/ColumnPicker";
import { useColumns } from "@dashboard/components/Datagrid/ColumnPicker/useColumns";
import Datagrid from "@dashboard/components/Datagrid/Datagrid";
import {
  DatagridChangeStateContext,
  useDatagridChangeState,
} from "@dashboard/components/Datagrid/hooks/useDatagridChange";
import {
  OrderDetailsFragment,
  OrderLineFragment,
  OrderStatus,
  // [수정] 샘플 추가를 위한 새 뮤테이션 훅 import
  useOrderBonusLinesCreateMutation,
  useOrderLineVariantSwapMutation,
  // [참고] orderPartialCancelMutation 훅은 codegen으로 생성된 것을 사용
  useOrderPartialCancelMutation,
} from "@dashboard/graphql";
import useListSettings from "@dashboard/hooks/useListSettings";
import useNotifier from "@dashboard/hooks/useNotifier";
import { productPath } from "@dashboard/products/urls";
import { ListViews } from "@dashboard/types";
// [수정] Macaw UI에서 필요한 컴포넌트 import
import { Box, Button } from "@saleor/macaw-ui-next";
import { ExternalLink, Plus } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { messages as orderMessages } from "../OrderListDatagrid/messages";
import { createGetCellContent, orderDetailsStaticColumnsAdapter } from "./datagrid";
import { messages } from "./messages";
// [추가] 샘플 추가 다이얼로그 import
import { BonusAllocation, OrderLineAddBonusDialog } from "./OrderLineAddBonusDialog";
import { ExchangeAllocation, OrderLineExchangeDialog } from "./OrderLineExchangeDialog";
import {
  OrderLinePartialCancelDialog,
  OrderLinePartialCancelFormData,
} from "./OrderLinePartialCancelDialog";

interface OrderDetailsDatagridProps {
  lines: OrderLineFragment[];
  loading: boolean;
  order: OrderDetailsFragment;
  paymentMethodType?: string | null;
}

export const OrderDetailsDatagrid = ({
  lines,
  loading,
  order,
  paymentMethodType,
}: OrderDetailsDatagridProps) => {
  const intl = useIntl();
  const notify = useNotifier();
  const datagrid = useDatagridChangeState();
  const { updateListSettings, settings } = useListSettings(ListViews.ORDER_DETAILS_LIST);

  // --- State Management for Dialogs ---
  const [cancelLine, setCancelLine] = useState<OrderLineFragment | null>(null);
  const [exchangeLine, setExchangeLine] = useState<OrderLineFragment | null>(null);
  const [isAddBonusOpen, setIsAddBonusOpen] = useState(false);

  // --- Mutations ---
  const [partialCancel] = useOrderPartialCancelMutation({
    onCompleted: data => {
      const errors = data.orderPartialCancel?.errors || [];
      if (errors.length === 0) {
        notify({
          status: "success",
          text: "주문이 부분 취소되었습니다.",
        });
        // 성공 시 데이터 리패치나 캐시 업데이트 필요
      } else {
        notify({
          status: "error",
          text: `취소 실패: ${errors[0].message}`,
        });
      }
    },
    onError: error => {
      notify({
        status: "error",
        text: `서버 오류: ${error.message}`,
      });
    },
  });

  const [swapVariant] = useOrderLineVariantSwapMutation({
    onCompleted: data => {
      const errors = data.orderLineVariantSwap?.errors || [];
      if (errors.length === 0) {
        notify({
          status: "success",
          text: "상품이 성공적으로 교환되었습니다.",
        });
        window.location.reload(); // 페이지 새로고침으로 데이터 갱신
      } else {
        notify({
          status: "error",
          text: `교환 실패: ${errors[0].message}`,
        });
      }
    },
    onError: error => {
      notify({
        status: "error",
        text: `서버 오류: ${error.message}`,
      });
    },
  });

  // [추가] 샘플/보너스 상품 추가 전용 뮤테이션
  const [addBonusLines] = useOrderBonusLinesCreateMutation({
    onCompleted: data => {
      const errors = data.orderBonusLinesCreate?.errors || [];
      if (errors.length === 0) {
        notify({
          status: "success",
          text: "샘플/보너스 상품이 추가되었습니다.",
        });
      } else {
        notify({
          status: "error",
          text: `추가 실패: ${errors[0].message}`,
        });
      }
    },
    onError: error => {
      notify({
        status: "error",
        text: `서버 오류: ${error.message}`,
      });
    },
  });

  // --- Event Handlers ---
  const handleCancelClick = useCallback((line: OrderLineFragment) => {
    setCancelLine(line);
  }, []);

  const handleConfirmCancel = (lineId: string, data: OrderLinePartialCancelFormData) => {
    partialCancel({
      variables: {
        id: order.id,
        lines: [{ lineId: lineId, quantity: data.quantity }],
        refundBankCode: data.refundBankCode,
        refundAccountNumber: data.refundAccountNumber,
        refundHolderName: data.refundHolderName,
      },
    });
  };

  const handleExchangeClick = useCallback((line: OrderLineFragment) => {
    setExchangeLine(line);
  }, []);

  const handleConfirmExchange = (lineId: string, allocations: ExchangeAllocation[]) => {
    const input = allocations.map(a => ({
      newVariantId: a.variantId,
      quantity: a.quantity,
    }));
    swapVariant({
      variables: { id: lineId, input: input },
    });
  };

  // [추가] 샘플/보너스 추가 확인 핸들러
  const handleConfirmAddBonus = (allocations: BonusAllocation[]) => {
    const linesInput = allocations.map(a => ({
      variantId: a.variantId,
      quantity: a.quantity,
    }));
    addBonusLines({
      variables: {
        id: order.id,
        input: linesInput,
      },
    });
  };

  // --- Datagrid Configuration ---
  const orderDetailsStaticColumns = useMemo(() => orderDetailsStaticColumnsAdapter(intl), [intl]);

  const handleColumnChange = useCallback(
    picked => {
      if (updateListSettings) {
        updateListSettings("columns", picked.filter(Boolean));
      }
    },
    [updateListSettings],
  );

  const { handlers, visibleColumns, staticColumns, selectedColumns, recentlyAddedColumn } =
    useColumns({
      gridName: "order_details_products",
      staticColumns: orderDetailsStaticColumns,
      selectedColumns: settings?.columns ?? [],
      onSave: handleColumnChange,
    });

  const getCellContent = useCallback(
    createGetCellContent({
      columns: visibleColumns,
      data: lines,
      loading,
      onCancelLine: handleCancelClick,
      orderStatus: order.status,
      onExchangeLine: handleExchangeClick,
    }),
    [visibleColumns, lines, loading, handleCancelClick, handleExchangeClick, order.status],
  );

  const getMenuItems = useCallback(
    index => [
      {
        disabled: !lines[index]?.variant?.product.id,
        label: intl.formatMessage(messages.productDetails),
        Icon: (
          <ExternalLink
          // Link 컴포넌트가 Icon 내부에 있으면 클릭 이벤트가 중복될 수 있으므로
          // 실제 동작은 onSelect에서 처리하거나 외부 Link로 감싸는 것이 더 좋습니다.
          />
        ),
        onSelect: () => {
          if (lines[index]?.variant?.product.id) {
            window.open(productPath(lines[index].variant.product.id), "_blank");
          }
        },
      },
    ],
    [intl, lines],
  );

  const canAddBonus = [
    OrderStatus.UNFULFILLED,
    OrderStatus.PARTIALLY_FULFILLED,
    OrderStatus.UNCONFIRMED,
  ].includes(order.status);

  // --- JSX Rendering ---
  return (
    <>
      {canAddBonus && (
        <Box display="flex" justifyContent="flex-end" marginBottom={2}>
          <Button variant="secondary" onClick={() => setIsAddBonusOpen(true)}>
            <Plus />
            <span>샘플/보너스 추가</span>
          </Button>
        </Box>
      )}

      <DatagridChangeStateContext.Provider value={datagrid}>
        <Datagrid
          showEmptyDatagrid
          rowMarkers="none"
          columnSelect="single"
          freezeColumns={1}
          availableColumns={visibleColumns}
          emptyText={intl.formatMessage(orderMessages.emptyText)}
          getCellContent={getCellContent}
          getCellError={() => false}
          menuItems={getMenuItems}
          rows={loading ? 1 : lines.length}
          selectionActions={() => null}
          onColumnResize={handlers.onResize}
          onColumnMoved={handlers.onMove}
          recentlyAddedColumn={recentlyAddedColumn}
          renderColumnPicker={() => (
            <ColumnPicker
              staticColumns={staticColumns}
              selectedColumns={selectedColumns}
              onToggle={handlers.onToggle}
            />
          )}
        />
      </DatagridChangeStateContext.Provider>

      {/* Dialogs */}
      <OrderLinePartialCancelDialog
        open={!!cancelLine}
        line={cancelLine}
        paymentMethodType={paymentMethodType}
        onClose={() => setCancelLine(null)}
        onConfirm={handleConfirmCancel}
      />

      <OrderLineExchangeDialog
        open={!!exchangeLine}
        line={exchangeLine}
        channelSlug={order.channel.slug}
        onClose={() => setExchangeLine(null)}
        onConfirm={handleConfirmExchange}
      />

      <OrderLineAddBonusDialog
        open={isAddBonusOpen}
        channelSlug={order.channel.slug}
        onClose={() => setIsAddBonusOpen(false)}
        onConfirm={handleConfirmAddBonus}
      />
    </>
  );
};
