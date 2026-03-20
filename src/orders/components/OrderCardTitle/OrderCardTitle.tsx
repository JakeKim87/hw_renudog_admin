// @ts-strict-ignore
import DefaultCardTitle from "@dashboard/components/CardTitle";
import HorizontalSpacer from "@dashboard/components/HorizontalSpacer";
import { FulfillmentStatus } from "@dashboard/graphql";
import { StatusType } from "@dashboard/types";
import { Text } from "@saleor/macaw-ui-next";
import React from "react";
import { FormattedMessage } from "react-intl";

import { orderTitleMessages } from "./messages";
import { useStyles } from "./styles";
import { getOrderTitleMessage } from "./utils";

export type CardTitleStatus = FulfillmentStatus | "unfulfilled";

export type CardTitleLines = Array<{
  quantity: number;
  quantityToFulfill?: number;
}>;

interface OrderCardTitleProps {
  fulfillmentOrder?: number;
  status: CardTitleStatus;
  toolbar?: React.ReactNode;
  orderNumber?: string;
  warehouseName?: string;
  withStatus?: boolean;
  className?: string;
  titleText?: string;
}

const selectStatus = (status: CardTitleStatus) => {
  switch (status) {
    case FulfillmentStatus.FULFILLED:
      return StatusType.SUCCESS;
    case FulfillmentStatus.REFUNDED:
      return StatusType.INFO;
    case FulfillmentStatus.RETURNED:
      return StatusType.INFO;
    case FulfillmentStatus.REPLACED:
      return StatusType.INFO;
    case FulfillmentStatus.REFUNDED_AND_RETURNED:
      return StatusType.INFO;
    case FulfillmentStatus.WAITING_FOR_APPROVAL:
      return StatusType.WARNING;
    case FulfillmentStatus.CANCELED:
      return StatusType.ERROR;
    default:
      return StatusType.ERROR;
  }
};
const OrderCardTitle: React.FC<OrderCardTitleProps> = ({
  status,
  warehouseName,
  withStatus = false,
  toolbar,
  className,
  titleText,
}) => {
  const classes = useStyles({});
  
  // getOrderTitleMessage는 여기서 호출하여 메시지 객체를 가져옵니다.
  const messageForStatus = getOrderTitleMessage(status);

  return (
    <DefaultCardTitle
      toolbar={toolbar}
      className={className}
      title={
        <div className={classes.title}>
          {withStatus && <HorizontalSpacer spacing={2} />}
          
          <Text className={classes.cardHeader}>
            {/* titleText prop이 있으면 그 텍스트를 바로 표시하고, */}
            {titleText ? (
              titleText
            ) : (
              // 없으면 FormattedMessage 컴포넌트를 올바르게 사용합니다.
              <FormattedMessage {...messageForStatus} />
            )}
          </Text>

          {/* {!!warehouseName && (
            <Text className={classes.warehouseName} size={2} fontWeight="light">
              <FormattedMessage
                {...orderTitleMessages.fulfilledFrom}
                values={{ warehouseName }}
              />
            </Text>
          )} */}
        </div>
      }
    />
  );
};

OrderCardTitle.displayName = "OrderCardTitle";
export default OrderCardTitle;