import { DateTime } from "@dashboard/components/Date";
import { Pill } from "@dashboard/components/Pill";
import { DeliveryStatus, OrderDetailsFragment, OrderStatus } from "@dashboard/graphql";
import { transformDeliveryStatus, transformOrderStatus } from "@dashboard/misc";
import { StatusType } from "@dashboard/types";
import { makeStyles } from "@saleor/macaw-ui";
import { Box, Skeleton, Text } from "@saleor/macaw-ui-next";
import React from "react";
import { useIntl } from "react-intl";

export interface TitleProps {
  order?: OrderDetailsFragment;
}

const useStyles = makeStyles(
  theme => ({
    container: {
      alignItems: "center",
      display: "flex",
      gap: theme.spacing(2),
    },
    statusContainer: {
      marginLeft: theme.spacing(2),
    },
  }),
  { name: "OrderDetailsTitle" },
);
const Title: React.FC<TitleProps> = props => {
  const intl = useIntl();
  const classes = useStyles(props);
  const { order } = props;

  if (!order) {
    return null;
  }

  let pillData: { localized: string; status: StatusType };

  // 1. [추가] 가장 먼저 주문 상태가 'COMPLETED'인지 확인합니다.
  if (order.status === OrderStatus.COMPLETED) {
    pillData = {
      localized: "처리 완료",
      status: StatusType.SUCCESS, // 초록색
    };
  }
  // 2. 'COMPLETED'가 아니라면, 'FULFILLED'인지 확인합니다.
  else if (order.status === OrderStatus.FULFILLED) {
    const deliveryStatus = order.fulfillments?.[0]?.deliveryStatus as DeliveryStatus;

    if (deliveryStatus) {
      // 'FULFILLED'이면서 deliveryStatus가 있으면, 배송 상태를 기준으로 표시
      pillData = transformDeliveryStatus(deliveryStatus);
    } else {
      // (예외 처리) 'FULFILLED'인데 deliveryStatus가 없는 경우, 기존 방식대로 '처리 완료' 표시
      pillData = transformOrderStatus(order.status, intl);
    }
  }
  // 3. 'COMPLETED'도 'FULFILLED'도 아닌 나머지 모든 상태는 기존 방식을 따릅니다.
  else {
    pillData = transformOrderStatus(order.status, intl);
  }

  return (
    <div className={classes.container}>
      <Box display="flex" justifyContent="center" alignItems="center">
        {`주문번호 ${order?.number}`}
        <div className={classes.statusContainer}>
          <Pill data-test-id="status-info" label={pillData.localized} color={pillData.status} />
        </div>
      </Box>

      <div>
        {order && order.created ? (
          <Text size={3} fontWeight="regular">
            <DateTime date={order.created} plain />
          </Text>
        ) : (
          <Skeleton style={{ width: "10em" }} />
        )}
      </div>
    </div>
  );
};

export default Title;
