import { DeliveryStatus } from "@dashboard/graphql";
import { deliveredOrderListUrl, OrderListUrlQueryParams } from "@dashboard/orders/urls";
import React from "react";

import OrderList from "../OrderList";


interface DeliveredOrderListProps {
  params: OrderListUrlQueryParams;
}

export const DeliveredOrderList: React.FC<DeliveredOrderListProps> = ({ params }) => (
  <OrderList
    params={params}
    defaultStatusFilter={DeliveryStatus.DELIVERED}
    pageTitle="배송 완료 주문"
    listUrl={deliveredOrderListUrl}
  />
);

export default DeliveredOrderList;