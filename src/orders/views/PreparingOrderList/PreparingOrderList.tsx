import { DeliveryStatus } from "@dashboard/graphql";
import { OrderListUrlQueryParams, preparingOrderListUrl } from "@dashboard/orders/urls";
import React from "react";

import OrderList from "../OrderList";

interface PreparingOrderListProps {
  params: OrderListUrlQueryParams;
}

/**
 * '배송 준비중' 전용 주문 목록 페이지입니다.
 */
export const PreparingOrderList: React.FC<PreparingOrderListProps> = ({ params }) => (
  <OrderList
    params={params}
    defaultStatusFilter={DeliveryStatus.PREPARING}
    pageTitle="배송 준비중 주문"
    listUrl={preparingOrderListUrl}
  />
);

export default PreparingOrderList;