// @ts-strict-ignore
import { MutationFunction } from "@apollo/client";
import { DashboardCard } from "@dashboard/components/Card";
import {
  DeliveryStatus,
  FulfillmentFragment,
  FulfillmentStatus,
  OrderDetailsFragment,
  OrderFulfillmentUpdateDeliveryStatusMutation,
  OrderFulfillmentUpdateDeliveryStatusMutationVariables,
  OrderStatus,
  useOrderCompleteMutation,
} from "@dashboard/graphql";
import useNotifier from "@dashboard/hooks/useNotifier";
import { orderHasTransactions } from "@dashboard/orders/types";
import { mergeRepeatedOrderLines } from "@dashboard/orders/utils/data";
import { Dialog, DialogContent, DialogTitle } from "@material-ui/core";
import { Box, Button, Divider, Text } from "@saleor/macaw-ui-next";
import { Trash2 } from "lucide-react";
import React, { useState } from "react";

import OrderCardTitle from "../OrderCardTitle";
import { OrderDetailsDatagrid } from "../OrderDetailsDatagrid";
import ActionButtons from "./ActionButtons";
import ExtraInfoLines from "./ExtraInfoLines";

interface OrderFulfilledProductsCardProps {
  fulfillment: FulfillmentFragment;
  fulfillmentAllowUnpaid: boolean;
  order?: OrderDetailsFragment;
  onOrderFulfillmentApprove: () => void;
  onOrderFulfillmentCancel: () => void;
  onTrackingCodeAdd: () => void;
  dataTestId?: string;
  onShowMetadata: (id: string) => void;
  onDeliveryStatusUpdate: MutationFunction<
    OrderFulfillmentUpdateDeliveryStatusMutation,
    OrderFulfillmentUpdateDeliveryStatusMutationVariables
  >;
  deliveryStatusUpdateLoading: boolean;
  onOrderUpdate: () => void;
  children?: React.ReactNode;
}

const statusesToMergeLines = [
  FulfillmentStatus.REFUNDED,
  FulfillmentStatus.REFUNDED_AND_RETURNED,
  FulfillmentStatus.RETURNED,
  FulfillmentStatus.REPLACED,
];
const cancelableStatuses = [FulfillmentStatus.FULFILLED, FulfillmentStatus.WAITING_FOR_APPROVAL];
const fulfillmentLineToLine = ({
  quantity,
  orderLine,
}: OrderDetailsFragment["fulfillments"][0]["lines"][0]) => ({
  ...orderLine,
  quantity,
});

const OrderFulfilledProductsCard: React.FC<OrderFulfilledProductsCardProps> = props => {
  const {
    fulfillment,
    fulfillmentAllowUnpaid,
    order,
    onOrderFulfillmentApprove,
    onOrderFulfillmentCancel,
    onTrackingCodeAdd,
    onShowMetadata,
    dataTestId,
    onDeliveryStatusUpdate,
    onOrderUpdate,
  } = props;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const notify = useNotifier();

  const deliveryStatusMessages: Record<DeliveryStatus, string> = {
    PREPARING: "배송 준비 중",
    IN_TRANSIT: "배송 중",
    DELIVERED: "배송 완료",
    DELIVERY_FAILED: "배송 실패",
  };

  const [orderComplete, orderCompleteOpts] = useOrderCompleteMutation({
    onCompleted: data => {
      if (data.orderComplete.errors.length === 0) {
        notify({
          status: "success",
          text: "구매가 확정되고 포인트가 지급되었습니다.",
        });

        if (onOrderUpdate) {
          onOrderUpdate();
        }
      }
    },
  });

  if (!fulfillment) {
    return null;
  }

  const handleStatusSelect = (newStatus: DeliveryStatus) => {
    onDeliveryStatusUpdate({
      variables: {
        id: props.fulfillment.id,
        deliveryStatus: newStatus,
      },
    });
    setIsDialogOpen(false); // Modal 닫기
  };

  const isOrderFinalized =
    order?.status === OrderStatus.COMPLETED || order?.status === OrderStatus.CANCELED;

  const handlePurchaseConfirm = () => {
    if (order?.id) {
      orderComplete({
        variables: {
          id: order.id,
        },
      });
    }
  };

  const getCardTitleText = () => {
    // 1순위: 주문 상태가 COMPLETED 이면 '주문 완료'를 표시합니다.
    if (order?.status === OrderStatus.COMPLETED) {
      return "처리 완료";
    }

    // 2순위: 기존 로직 - FULFILLED 상태이고 배송 상태가 있으면 해당 상태를 표시합니다.
    if (order?.status === OrderStatus.FULFILLED && fulfillment?.deliveryStatus) {
      return deliveryStatusMessages[fulfillment.deliveryStatus];
    }

    // 그 외의 경우에는 undefined를 반환하여 OrderCardTitle의 기본 동작을 따르게 합니다.
    return undefined;
  };

  const cardTitleText = getCardTitleText();

  const getLines = () => {
    if (statusesToMergeLines.includes(fulfillment?.status)) {
      return mergeRepeatedOrderLines(fulfillment.lines).map(fulfillmentLineToLine);
    }

    return fulfillment?.lines.map(fulfillmentLineToLine) || [];
  };

  return (
    <Box data-test-id={dataTestId}>
      <OrderCardTitle
        withStatus
        fulfillmentOrder={fulfillment?.fulfillmentOrder}
        status={fulfillment?.status}
        warehouseName={fulfillment?.warehouse?.name}
        orderNumber={order?.number}
        titleText={cardTitleText}
        toolbar={
          <Box display="flex" alignItems="center" gap={6}>
            {fulfillment?.deliveryStatus === DeliveryStatus.DELIVERED &&
              order?.status === OrderStatus.FULFILLED && (
                <Button
                  variant="primary"
                  onClick={handlePurchaseConfirm}
                  disabled={orderCompleteOpts.loading}
                  data-test-id="confirm-purchase-button"
                >
                  구매 확정
                </Button>
              )}
            {!isOrderFinalized && fulfillment?.status === FulfillmentStatus.FULFILLED && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => setIsDialogOpen(true)}
                data-test-id="change-delivery-status-button"
              >
                배송 상태 변경
              </Button>
            )}

            {!isOrderFinalized && cancelableStatuses.includes(fulfillment?.status) && (
              <Button
                variant="secondary"
                onClick={onOrderFulfillmentCancel}
                data-test-id="cancel-fulfillment-button"
                icon={<Trash2 />}
              />
            )}
            {!isOrderFinalized && (
              <ActionButtons
                orderId={order?.id}
                status={fulfillment?.status}
                trackingNumber={fulfillment?.trackingNumber}
                orderIsPaid={order?.isPaid}
                fulfillmentAllowUnpaid={fulfillmentAllowUnpaid}
                onTrackingCodeAdd={onTrackingCodeAdd}
                onApprove={onOrderFulfillmentApprove}
                hasTransactions={orderHasTransactions(order)}
              />
            )}
          </Box>
        }
      />
      <DashboardCard.Content paddingX={0}>
        <OrderDetailsDatagrid
          lines={getLines()}
          loading={false}
          order={order}
          paymentMethodType={order?.payments[0]?.paymentMethodType || ""}
        />
        <ExtraInfoLines fulfillment={fulfillment} />
      </DashboardCard.Content>
      {props.children}
      <Divider />
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>배송 상태 변경</DialogTitle>
        <DialogContent>
          <Text>새로운 배송 상태를 선택하세요.</Text>
          <Box display="flex" flexDirection="column" gap={3} marginTop={6}>
            {Object.keys(deliveryStatusMessages).map(statusKey => {
              const status = statusKey as DeliveryStatus;

              return (
                <Button
                  key={status}
                  variant="secondary"
                  onClick={() => handleStatusSelect(status)}
                  // 버튼을 꽉 채우기 위해 width="100%" 추가
                  style={{ width: "100%" }}
                >
                  {deliveryStatusMessages[status]}
                </Button>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OrderFulfilledProductsCard;
