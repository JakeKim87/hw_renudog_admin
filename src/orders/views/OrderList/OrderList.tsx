// @ts-strict-ignore
import { useApolloClient, useMutation } from "@apollo/client";
import { useUser } from "@dashboard/auth";
import ChannelPickerDialog from "@dashboard/channels/components/ChannelPickerDialog";
import useAppChannel from "@dashboard/components/AppLayout/AppChannelContext";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import {
  DeliveryStatus,
  OrderExportQuery,
  OrderExportQueryVariables,
  OrderStatus,
  OrderStatusFilter,
  PaymentChargeStatusEnum,
  useCategoryListForFilteringQuery,
  useFulfillOrderMutation,
  useOrderCompleteMutation,
  useOrderDraftCreateMutation,
  useOrderFulfillmentUpdateDeliveryStatusMutation,
  useOrderListQuery,
} from "@dashboard/graphql";
import useListSettings from "@dashboard/hooks/useListSettings";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import { usePaginationReset } from "@dashboard/hooks/usePaginationReset";
import usePaginator, {
  createPaginationState,
  PaginatorContext,
} from "@dashboard/hooks/usePaginator";
import { useRowSelection } from "@dashboard/hooks/useRowSelection";
import { orderExportQuery } from "@dashboard/orders/queries";
import { ListViews } from "@dashboard/types";
import createDialogActionHandlers from "@dashboard/utils/handlers/dialogActionHandlers";
import createSortHandler from "@dashboard/utils/handlers/sortHandler";
import { mapEdgesToItems, mapNodeToChoice } from "@dashboard/utils/maps";
import { getSortParams } from "@dashboard/utils/sort";
import isEqual from "lodash/isEqual";
import React, { useCallback, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import { useIntl } from "react-intl";

import OrderListPage from "../../components/OrderListPage/OrderListPage";
import { orderListUrl, OrderListUrlDialog, OrderListUrlQueryParams, orderUrl } from "../../urls";
import { getFilterVariables } from "./filters"; // ✅ 이 함수를 우리가 수정했습니다.
import { getSortQueryVariables } from "./sort";

const getOrderStatusInKorean = (order: any): string => {
  // 1. COMPLETED 상태 처리 (최우선)
  if (order.status === "COMPLETED") {
    return "처리 완료";
  }

  // 2. FULFILLED 상태 처리 (deliveryStatus 참고)
  if (order.status === "FULFILLED") {
    // fulfillments 배열의 첫 번째 항목을 기준으로 삼습니다.
    const deliveryStatus = order.fulfillments?.[0]?.deliveryStatus;

    switch (deliveryStatus) {
      case DeliveryStatus.PREPARING:
        return "배송 준비중";
      case DeliveryStatus.IN_TRANSIT:
        return "배송중";
      case DeliveryStatus.DELIVERED:
        return "배송 완료";
      case DeliveryStatus.DELIVERY_FAILED:
        return "배송 실패";
      default:
        // deliveryStatus가 없거나 알 수 없는 경우, 기본 FULFILLED 상태명 반환
        return "배송 처리됨";
    }
  }

  // 3. 그 외 다른 상태들 처리
  switch (order.status) {
    case OrderStatus.UNFULFILLED:
      return "미처리";
    case OrderStatus.CANCELED:
      return "취소됨";
    case OrderStatus.PARTIALLY_FULFILLED:
      return "부분 배송";
    case OrderStatus.RETURNED:
      return "반품됨";
    case OrderStatus.DRAFT:
      return "초안";
    case OrderStatus.UNCONFIRMED:
      return "미확인";
    default:
      // 위 모든 경우에 해당하지 않으면 영문 상태명 그대로 반환
      return order.status;
  }
};

const getPaymentStatusInKorean = (paymentStatus: string): string => {
  switch (paymentStatus) {
    case PaymentChargeStatusEnum.FULLY_CHARGED:
      return "결제 완료";
    case PaymentChargeStatusEnum.NOT_CHARGED:
      return "결제 전";
    case PaymentChargeStatusEnum.PARTIALLY_CHARGED:
      return "부분 결제";
    case PaymentChargeStatusEnum.FULLY_REFUNDED:
      return "전체 환불";
    case PaymentChargeStatusEnum.PARTIALLY_REFUNDED:
      return "부분 환불";
    default:
      return paymentStatus; // 알 수 없는 상태는 영문 그대로 표시
  }
};

interface OrderListProps {
  params: OrderListUrlQueryParams;
  defaultStatusFilter?: OrderStatusFilter | DeliveryStatus;
  pageTitle?: string;
  listUrl?: (params?: OrderListUrlQueryParams) => string;
}

export const OrderList: React.FC<OrderListProps> = ({
  params,
  defaultStatusFilter,
  pageTitle,
  listUrl = orderListUrl,
}) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const { updateListSettings, settings } = useListSettings(ListViews.ORDER_LIST);
  const intl = useIntl();

  usePaginationReset(listUrl, params, settings.rowNumber);

  const { channel, availableChannels } = useAppChannel(false);
  const user = useUser();
  const channels = user?.user?.accessibleChannels ?? [];
  const channelOpts = availableChannels ? mapNodeToChoice(channels) : null;

  const [createOrder] = useOrderDraftCreateMutation({
    onCompleted: data => {
      notify({
        status: "success",
        text: intl.formatMessage({
          id: "6udlH+",
          defaultMessage: "Order draft successfully created",
        }),
      });
      navigate(orderUrl(data.draftOrderCreate.order.id));
    },
  });

  // ✅ 검색 처리를 위한 핸들러
  const handleSearchChange = (query: string) => {
    const newQs = {
      ...params,
      query,
      // 검색 시 첫 페이지로 리셋
      before: undefined,
      after: undefined,
    };

    navigate(orderListUrl(newQs));
  };

  const [openModal, closeModal] = createDialogActionHandlers<
    OrderListUrlDialog,
    OrderListUrlQueryParams
  >(navigate, orderListUrl, params);

  const paginationState = createPaginationState(settings.rowNumber, params);

  // ✅ getFilterVariables 호출 부분을 단순화
  const filterVariables = getFilterVariables(params, defaultStatusFilter);
  const sortVariables = getSortQueryVariables(params);

  const queryVariables = React.useMemo(
    () => ({
      ...paginationState,
      filter: filterVariables,
      sort: sortVariables,
    }),
    [filterVariables, paginationState, sortVariables], // valueProvider 제거
  );

  const { data, refetch } = useOrderListQuery({
    displayLoader: true,
    variables: queryVariables,
  });
  const orders = mapEdgesToItems(data?.orders);

  const {
    clearRowSelection,
    selectedRowIds,
    setClearDatagridRowSelectionCallback,
    setSelectedRowIds,
  } = useRowSelection(params);

  const { data: categoryData, loading: categoryLoading } = useCategoryListForFilteringQuery({
    variables: {
      first: 100, // 최대 100개의 카테고리를 가져옵니다. 필요시 늘려주세요.
    },
  });

  const paginationValues = usePaginator({
    pageInfo: data?.orders?.pageInfo,
    paginationState,
    queryString: params,
  });

  const handleSort = createSortHandler(navigate, listUrl, params);

  // ✅ 2. 일괄 상태 변경을 위한 mutation hook
  const [bulkFulfill, bulkFulfillOpts] = useFulfillOrderMutation();
  const [bulkComplete, bulkCompleteOpts] = useOrderCompleteMutation();
  const [bulkUpdateStatus, bulkUpdateStatusOpts] =
    useOrderFulfillmentUpdateDeliveryStatusMutation();

  // ✅ 3. Datagrid에 전달할 콜백 핸들러
  const handleSelectOrderIds = useCallback(
    (rows: number[], clearSelection: () => void) => {
      if (!orders) {
        return;
      }

      const rowsIds = rows.map(row => orders[row].id);
      const haveSameValues = isEqual(rowsIds, selectedRowIds);

      if (!haveSameValues) {
        setSelectedRowIds(rowsIds);
      }

      setClearDatagridRowSelectionCallback(clearSelection);
    },
    [orders, selectedRowIds, setClearDatagridRowSelectionCallback, setSelectedRowIds],
  );

  const handleBulkFulfill = async () => {
    const selectedOrders = selectedRowIds.map(id => orders.find(order => order.id === id));

    notify({ status: "info", text: `${selectedOrders.length}개 주문을 처리 중입니다...` });

    const results = await Promise.all(
      selectedOrders.map(order => {
        const linesToFulfill = order.lines
          .filter(line => line.quantityToFulfill > 0 && line.allocations.length > 0)
          .map(line => {
            const warehouseId = line.allocations[0].warehouse.id;

            return {
              orderLineId: line.id,
              stocks: [
                {
                  quantity: line.quantityToFulfill,
                  warehouse: warehouseId,
                },
              ],
            };
          });

        if (linesToFulfill.length === 0) {
          return Promise.resolve({
            data: {
              orderFulfill: {
                errors: [{ message: `주문 #${order.number}에 처리할 상품이 없습니다.` }],
              },
            },
          });
        }

        return bulkFulfill({
          variables: {
            orderId: order.id,
            input: {
              lines: linesToFulfill, // ✅ 올바른 구조의 lines 배열을 전달
              notifyCustomer: true,
            },
          },
        });
      }),
    );

    const errors = results.filter(result => result.data?.orderFulfill?.errors?.length > 0);

    if (errors.length > 0)
      notify({ status: "error", text: `오류: ${errors.length}개 주문 처리에 실패했습니다.` });
    else
      notify({
        status: "success",
        text: `${selectedOrders.length}개 주문을 성공적으로 처리했습니다.`,
      });

    refetch();
    clearRowSelection();
  };

  // ✅ 4. 일괄 처리 로직
  const handleBulkUpdate = async (targetStatus: DeliveryStatus) => {
    const selectedOrders = selectedRowIds.map(id => orders.find(order => order.id === id));

    notify({
      status: "info",
      text: `${selectedOrders.length}개 주문의 상태를 변경 중입니다...`,
    });

    const results = await Promise.all(
      selectedOrders.map(order => {
        // 현재 상태(예: PREPARING)와 일치하는 fulfillment를 찾습니다.
        // 이 로직은 비즈니스 규칙에 따라 더 정교하게 만들 수 있습니다.
        const fulfillmentToUpdate = order.fulfillments?.find(
          f => f.deliveryStatus === defaultStatusFilter,
        );

        if (!fulfillmentToUpdate) {
          return Promise.resolve({
            data: {
              orderFulfillmentUpdateDeliveryStatus: {
                errors: [
                  {
                    message: `주문 #${order.number}에서 업데이트할 '${defaultStatusFilter}' 상태의 배송을 찾을 수 없습니다.`,
                  },
                ],
              },
            },
          });
        }

        return bulkUpdateStatus({
          variables: {
            id: fulfillmentToUpdate.id,
            deliveryStatus: targetStatus,
          },
        });
      }),
    );

    const errors = results.filter(
      result => result.data?.orderFulfillmentUpdateDeliveryStatus?.errors?.length > 0,
    );

    if (errors.length > 0) {
      notify({
        status: "error",
        text: `오류: ${errors.length}개 주문의 상태 변경에 실패했습니다.`,
      });
    } else {
      notify({
        status: "success",
        text: `${selectedOrders.length}개 주문의 상태를 성공적으로 변경했습니다.`,
      });
    }

    refetch();
    clearRowSelection();
  };

  const handleBulkComplete = async () => {
    const selectedOrders = selectedRowIds.map(id => orders.find(order => order.id === id));

    notify({ status: "info", text: `${selectedOrders.length}개 주문을 완료 처리 중입니다...` });

    const results = await Promise.all(
      selectedOrders.map(order => bulkComplete({ variables: { id: order.id } })),
    );

    const errors = results.filter(result => result.data?.orderComplete?.errors?.length > 0);

    if (errors.length > 0)
      notify({ status: "error", text: `오류: ${errors.length}개 주문 완료 처리에 실패했습니다.` });
    else
      notify({
        status: "success",
        text: `${selectedOrders.length}개 주문을 성공적으로 완료 처리했습니다.`,
      });

    refetch();
    clearRowSelection();
  };

  // ✅ 5. 페이지 상태에 따른 동적 props 생성
  const getBulkActionProps = () => {
    const confirmButtonState: ConfirmButtonTransitionState =
      bulkFulfillOpts.loading || bulkCompleteOpts.loading || bulkUpdateStatusOpts.loading
        ? "loading"
        : "default";

    switch (defaultStatusFilter) {
      case OrderStatusFilter.UNFULFILLED:
        return {
          onBulkAction: handleBulkFulfill,
          bulkActionProps: { buttonTitle: "일괄 처리", confirmButtonState },
        };
      case DeliveryStatus.PREPARING:
        return {
          onBulkAction: () => handleBulkUpdate(DeliveryStatus.IN_TRANSIT),
          bulkActionProps: { buttonTitle: "배송중으로 변경", confirmButtonState },
        };
      case DeliveryStatus.IN_TRANSIT:
        return {
          onBulkAction: () => handleBulkUpdate(DeliveryStatus.DELIVERED),
          bulkActionProps: { buttonTitle: "배송완료로 변경", confirmButtonState },
        };
      case DeliveryStatus.DELIVERED:
        return {
          onBulkAction: handleBulkComplete,
          bulkActionProps: { buttonTitle: "처리 완료", confirmButtonState },
        };
      default:
        return { onBulkAction: () => {}, bulkActionProps: undefined };
    }
  };

  const { onBulkAction, bulkActionProps } = getBulkActionProps();

  const client = useApolloClient(); // Apollo Client 인스턴스 가져오기
  const [exportLoading, setExportLoading] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const csvLink = useRef(null);

  const handleExport = async () => {
    setExportLoading(true);
    notify({ status: "info", text: "엑셀 데이터를 생성 중입니다..." });

    let allEdges = [];
    let hasNextPage = true;
    let endCursor = null;

    try {
      while (hasNextPage) {
        // client.query를 직접 사용하여 페이지네이션을 수동으로 제어합니다.
        // 자동 생성된 타입을 사용하여 타입 안정성을 확보합니다.
        const { data } = await client.query<OrderExportQuery, OrderExportQueryVariables>({
          query: orderExportQuery,
          variables: {
            filter: filterVariables,
            sort: sortVariables,
            after: endCursor,
            first: 100,
          },
          fetchPolicy: "network-only",
        });

        if (data?.orders?.edges) {
          allEdges = [...allEdges, ...data.orders.edges];
          hasNextPage = data.orders.pageInfo.hasNextPage;
          endCursor = data.orders.pageInfo.endCursor;
        } else {
          hasNextPage = false;
        }
      }

      if (allEdges.length > 0) {
        const formattedData = allEdges.map(({ node: order }) => {
          const totalQuantity = order.lines?.reduce((acc, line) => acc + line.quantity, 0) ?? 0;

          // 주문 상품명(옵션) 형식으로 만들기
          const productsText =
            order.lines
              ?.map(line => {
                // 옵션(variantName)이 있으면 괄호 안에 포함, 없으면 상품명만
                const variantText = line.variantName ? `(${line.variantName})` : "";
                // 최종적으로 "상품명(옵션) x 수량" 형태의 문자열을 만듭니다.

                return `${line.productName}${variantText} x ${line.quantity}`;
              })
              .join("\n") ?? ""; // 여러 상품은 줄바꿈으로 구분

          // 여러 개의 송장번호가 있을 경우 쉼표로 구분
          const trackingNumbers =
            order.fulfillments
              ?.map(f => f.trackingNumber)
              .filter(Boolean) // 빈 송장번호 제외
              .join(", ") ?? "";

          const isExpress = order.metadata?.some(
            meta => meta.key === "isExpressDelivery" && meta.value === "true",
          );

          // 결제 방식 추출
          const getPaymentMethod = () => {
            const methods: string[] = [];

            // 1. 기본 결제 수단 (카드, 가상계좌 등) 확인
            if (order.payments && order.payments.length > 0) {
              // 가장 최근 혹은 첫 번째 결제 수단 정보 확인
              const payment = order.payments[0];
              const methodType = payment.paymentMethodType || payment.gateway;

              const methodMap: Record<string, string> = {
                card: "카드",
                vbank: "가상계좌",
                bank: "계좌이체",
                cash: "현금",
                other: "기타",
              };

              const mappedName = methodMap[methodType] || methodType;
              if (mappedName) {
                methods.push(mappedName);
              }
            }

            // 2. 적립금 사용 여부 확인 (0보다 클 경우 추가)
            if ((order.pointsUsed ?? 0) > 0) {
              methods.push("적립금");
            }

            // 3. 예치금 사용 여부 확인 (0보다 클 경우 추가)
            if ((order.depositUsed ?? 0) > 0) {
              methods.push("예치금");
            }

            // 배열에 담긴 결제 수단들을 ", "로 연결 (예: "카드, 적립금")
            return methods.join(", ");
          };

          return {
            // --- 기존 데이터 ---
            number: order.number,
            created: new Date(order.created).toLocaleString("ko-KR"),
            customer: order.user?.businessName || order.userEmail,
            total: order.total.gross.amount,
            quantity: totalQuantity,
            totalCharged: order.totalCharged?.amount ?? 0,
            pointsUsed: order.pointsUsed ?? 0,
            depositUsed: order.depositUsed ?? 0,
            status: getOrderStatusInKorean(order),
            paymentStatus: getPaymentStatusInKorean(order.paymentStatus),
            paymentMethod: getPaymentMethod(),
            receiptRequiredDate: order.receiptRequiredDate
              ? new Date(order.receiptRequiredDate).toLocaleDateString("ko-KR")
              : "",
            recipient: `${order.shippingAddress?.lastName || ""}${order.shippingAddress?.firstName || ""}`,
            recipientPhone: order.shippingAddress?.phone || "",
            postalCode: order.shippingAddress?.postalCode || "",
            address:
              `${order.shippingAddress?.streetAddress1 || ""} ${order.shippingAddress?.streetAddress2 || ""}`.trim(),
            products: productsText,
            trackingNumber: trackingNumbers,
            isExpress: isExpress ? "예" : "아니오",
          };
        });

        setCsvData(formattedData);
        setTimeout(() => {
          csvLink.current.link.click();
          setCsvData([]);
        }, 0);
      } else {
        notify({ status: "error", text: "엑셀로 내보낼 데이터가 없습니다." });
      }
    } catch (e) {
      console.error("Excel export failed", e);
      notify({ status: "error", text: "데이터를 내보내는 중 오류가 발생했습니다." });
    } finally {
      setExportLoading(false);
    }
  };

  const headers = [
    { label: "주문번호", key: "number" },
    { label: "주문일시", key: "created" },
    { label: "주문자(사업자명)", key: "customer" },
    { label: "총 수량", key: "quantity" },
    { label: "총 주문금액", key: "total" },
    { label: "실결제금액", key: "totalCharged" },
    { label: "사용포인트", key: "pointsUsed" },
    { label: "사용예치금", key: "depositUsed" },
    { label: "주문상태", key: "status" },
    { label: "결제상태", key: "paymentStatus" },
    { label: "결제방식", key: "paymentMethod" },
    { label: "수령희망날짜", key: "receiptRequiredDate" },
    { label: "수령인", key: "recipient" },
    { label: "수령인 휴대폰번호", key: "recipientPhone" },
    { label: "우편번호", key: "postalCode" },
    { label: "주소", key: "address" },
    { label: "주문상품(옵션)", key: "products" },
    { label: "송장번호", key: "trackingNumber" },
  ];

  return (
    <PaginatorContext.Provider value={paginationValues}>
      <OrderListPage
        disabled={!data}
        orders={mapEdgesToItems(data?.orders)}
        settings={settings}
        onUpdateListSettings={updateListSettings}
        sort={getSortParams(params)}
        onSort={handleSort}
        initialSearch={params.query || ""}
        onSearchChange={handleSearchChange}
        onAdd={() => openModal("create-order")}
        params={params}
        onExport={handleExport}
        exportLoading={exportLoading}
        categories={mapEdgesToItems(categoryData?.categories)}
        categoryLoading={categoryLoading}
        pageTitle={pageTitle}
        hideStatusFilter={!!defaultStatusFilter}
        selectedOrderIds={selectedRowIds}
        onSelectOrderIds={handleSelectOrderIds}
        onClearSelection={clearRowSelection}
        onBulkAction={onBulkAction}
        bulkActionProps={bulkActionProps}
      />

      {csvData.length > 0 && (
        <CSVLink
          data={csvData}
          headers={headers}
          filename={`orders_${new Date().toISOString().slice(0, 10)}.csv`}
          ref={csvLink}
          target="_blank"
        />
      )}

      {/* ✅ 채널 선택 다이얼로그는 유지 */}
      <ChannelPickerDialog
        channelsChoices={channelOpts}
        confirmButtonState="success"
        defaultChoice={channel?.id}
        open={params.action === "create-order"}
        onClose={closeModal}
        onConfirm={channelId =>
          createOrder({
            variables: {
              input: { channelId },
            },
          })
        }
      />
    </PaginatorContext.Provider>
  );
};

export default OrderList;
