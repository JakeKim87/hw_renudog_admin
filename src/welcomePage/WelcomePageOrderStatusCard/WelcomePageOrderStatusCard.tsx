// @ts-strict-ignore
import { DeliveryStatus, OrderStatusFilter } from "@dashboard/graphql";
import { deliveredOrderListPath, inTransitOrderListPath, orderListPath, preparingOrderListPath, unfulfilledOrderListPath } from "@dashboard/orders/urls";
import { Skeleton } from "@saleor/macaw-ui-next";
import { stringify } from "qs";
import React from "react";
import { Link } from "react-router-dom";

import { WelcomePageAnalyticsCard } from "../WelcomePageSidebar/components/WelcomePageAnalyticsCard";


// 이 컴포넌트가 받을 데이터의 모양을 정의합니다.
interface WelcomePageOrderStatusCardProps {
  title: string;
  status: OrderStatusFilter | DeliveryStatus;
  count: number | undefined;
  loading: boolean;
  hasError: boolean;
  testId?: string;
}

const getUrlForStatus = (status: OrderStatusFilter | DeliveryStatus): string => {
  switch (status) {
    case OrderStatusFilter.UNFULFILLED:
      return unfulfilledOrderListPath;
    case DeliveryStatus.PREPARING:
      return preparingOrderListPath;
    case DeliveryStatus.IN_TRANSIT:
      return inTransitOrderListPath;
    case DeliveryStatus.DELIVERED:
      return deliveredOrderListPath;
    // 혹시 모를 다른 상태값이 들어올 경우를 대비해 기본 경로를 반환합니다.
    default:
      return orderListPath;
  }
};


// 부모에게서 받은 데이터를 화면에 그립니다.
export const WelcomePageOrderStatusCard = ({
  title,
  status,
  count,
  loading,
  hasError,
  testId,
}: WelcomePageOrderStatusCardProps) => {
  
  const targetUrl = getUrlForStatus(status);

  return (
    <Link to={targetUrl} style={{ textDecoration: "none", color: "inherit" }}>
      <WelcomePageAnalyticsCard title={title} testId={testId} withSubtitle={false}>
        {hasError ? 0 : !loading ? count ?? 0 : <Skeleton style={{ minWidth: "4ch" }} />}
      </WelcomePageAnalyticsCard>
    </Link>
  );
};