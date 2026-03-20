import { OrderStatusFilter } from "@dashboard/graphql";
import { OrderListUrlQueryParams, unfulfilledOrderListUrl } from "@dashboard/orders/urls";
import React from "react";

import OrderList from "../OrderList";


interface UnfulfilledOrderListProps {
  params: OrderListUrlQueryParams;
}

export const UnfulfilledOrderList: React.FC<UnfulfilledOrderListProps> = ({ params }) => (
  <OrderList
    params={params}
    // 1. 고정할 상태 값을 props로 전달합니다.
    defaultStatusFilter={OrderStatusFilter.UNFULFILLED}
    // 2. 페이지 제목을 지정합니다.
    pageTitle="미처리 주문"
    listUrl={unfulfilledOrderListUrl}
  />
);

export default UnfulfilledOrderList;