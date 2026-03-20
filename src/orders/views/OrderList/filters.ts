import {
  DateRangeInput,
  DeliveryStatus,
  OrderFilterInput,
  OrderStatusFilter,
  PaymentMethodTypeEnum,
  UserType,
} from "@dashboard/graphql";
import { OrderListUrlQueryParams } from "@dashboard/orders/urls";

const DELIVERY_STATUSES = Object.values(DeliveryStatus);

export function getFilterVariables(
  params: OrderListUrlQueryParams,
  defaultStatusFilter?: OrderStatusFilter | DeliveryStatus,
): OrderFilterInput {
  const filter: OrderFilterInput = {};

  if (params.createdFrom || params.createdTo) {
    const dateRange: DateRangeInput = {};

    if (params.createdFrom) {
      dateRange.gte = params.createdFrom; // gte: 시작일
    }

    if (params.createdTo) {
      dateRange.lte = params.createdTo; // lte: 종료일
    }

    filter.created = dateRange;
  }

  if (defaultStatusFilter) {
    // 1-1. 전달된 값이 DeliveryStatus에 해당하는지 확인합니다.
    if (DELIVERY_STATUSES.includes(defaultStatusFilter as DeliveryStatus)) {
      filter.fulfillmentDeliveryStatus = [defaultStatusFilter as DeliveryStatus];
      filter.status = [OrderStatusFilter.FULFILLED]; // 배송 상태는 항상 주문 상태가 FULFILLED일 때만 의미가 있습니다.
    } else {
      // 1-2. 그 외에는 OrderStatusFilter로 간주합니다.
      filter.status = [defaultStatusFilter as OrderStatusFilter];
    }
  }
  // 2. defaultStatusFilter가 없으면, 기존처럼 URL 파라미터를 사용합니다.
  else {
    if (params.deliveryStatus) {
      filter.fulfillmentDeliveryStatus = [params.deliveryStatus as DeliveryStatus];
      filter.status = [OrderStatusFilter.FULFILLED];
    } else if (params.status) {
      // params.status가 단일 값이거나 배열일 수 있으므로 concat으로 처리합니다.
      filter.status = [].concat(params.status) as OrderStatusFilter[];
    }
  }

  if (params.paymentMethod) {
    filter.paymentMethodTypes = [params.paymentMethod.toUpperCase() as PaymentMethodTypeEnum];
  }

  if (params.category) {
    filter.category = params.category;
  }

  if (params.number) {
    filter.numbers = [params.number];
  }

  if (params.query) {
    filter.search = params.query;
  }

  if (params.userType) {
    filter.userType = [params.userType as UserType];
  }

  return filter;
}
