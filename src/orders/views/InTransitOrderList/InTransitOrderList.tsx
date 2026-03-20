import { DeliveryStatus } from "@dashboard/graphql";
import { inTransitOrderListUrl, OrderListUrlQueryParams } from "@dashboard/orders/urls";
import React from "react";

import OrderList from "../OrderList";

interface InTransitOrderListProps {
  params: OrderListUrlQueryParams;
}

/**
 * '배송중' 전용 주문 목록 페이지입니다.
 */
export const InTransitOrderList: React.FC<InTransitOrderListProps> = ({ params }) => (
  <OrderList
    params={params}
    defaultStatusFilter={DeliveryStatus.IN_TRANSIT}
    pageTitle="배송중 주문"
    listUrl={inTransitOrderListUrl}
  />
);

export default InTransitOrderList;