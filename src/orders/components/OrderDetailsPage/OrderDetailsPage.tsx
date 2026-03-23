// @ts-strict-ignore
import { FetchResult, useMutation } from "@apollo/client";
import { AppWidgets } from "@dashboard/apps/components/AppWidgets/AppWidgets";
import { TopNav } from "@dashboard/components/AppLayout/TopNav";
import { CardSpacer } from "@dashboard/components/CardSpacer";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import { useDevModeContext } from "@dashboard/components/DevModePanel/hooks";
import { DetailPageLayout } from "@dashboard/components/Layouts";
import { MetadataIdSchema } from "@dashboard/components/Metadata"; // Metadata 타입은 여전히 필요
import { Savebar } from "@dashboard/components/Savebar";
import { extensionMountPoints } from "@dashboard/extensions/extensionMountPoints";
import { getExtensionsItemsForOrderDetails } from "@dashboard/extensions/getExtensionsItems";
import { useExtensions } from "@dashboard/extensions/hooks/useExtensions";
import {
  FulfillmentStatus,
  OrderDetailsFragment,
  OrderDetailsQuery,
  OrderErrorFragment,
  OrderExchangeStatusEnum,
  OrderFulfillmentUpdateDeliveryStatusDocument,
  OrderFulfillmentUpdateDeliveryStatusMutation,
  OrderFulfillmentUpdateDeliveryStatusMutationVariables,
  OrderNoteUpdateMutation,
  OrderStatus,
  TransactionActionEnum,
  useOrderExchangeUpdateStatusMutation,
} from "@dashboard/graphql";
import { useBackLinkWithState } from "@dashboard/hooks/useBackLinkWithState";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import { defaultGraphiQLQuery } from "@dashboard/orders/queries";
import { orderListUrl } from "@dashboard/orders/urls";
import {
  Card,
  CardContent,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import { Divider } from "@saleor/macaw-ui-next";
import React from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router";

import { getMutationErrors, maybe } from "../../../misc";
// OrderChannelSectionCard, OrderCustomer 등 다른 컴포넌트 import는 그대로 유지
import OrderCustomer from "../OrderCustomer";
import OrderCustomerNote from "../OrderCustomerNote";
import OrderDraftDetails from "../OrderDraftDetails/OrderDraftDetails";
import { FormData as OrderDraftDetailsProductsFormData } from "../OrderDraftDetailsProducts";
import OrderFulfilledProductsCard from "../OrderFulfilledProductsCard";
import { FormData as HistoryFormData } from "../OrderHistory";
import { OrderPaymentOrTransaction } from "../OrderPaymentOrTransaction/OrderPaymentOrTransaction";
import OrderUnfulfilledProductsCard from "../OrderUnfulfilledProductsCard";
import { messages } from "./messages";
import Title from "./Title";
import {
  createOrderMetadataIdSchema,
  filteredConditionalItems,
  hasAnyItemsReplaceable,
} from "./utils";

export interface OrderDetailsPageProps {
  order: OrderDetailsFragment | OrderDetailsFragment;
  shop: OrderDetailsQuery["shop"];
  shippingMethods?: Array<{
    id: string;
    name: string;
  }>;
  loading: boolean;
  saveButtonBarState: ConfirmButtonTransitionState;
  errors: OrderErrorFragment[];
  onOrderLineAdd?: () => void;
  onOrderLineChange?: (id: string, data: OrderDraftDetailsProductsFormData) => void;
  onOrderLineRemove?: (id: string) => void;
  onShippingMethodEdit?: () => void;
  onBillingAddressEdit: () => any;
  onFulfillmentApprove: (id: string) => any;
  onFulfillmentCancel: (id: string) => any;
  onShowMetadata: (id: string) => void;
  onFulfillmentTrackingNumberUpdate: (id: string) => any;
  onOrderFulfill: () => any;
  onProductClick?: (id: string) => any;
  onPaymentCapture: () => any;
  onMarkAsPaid: () => any;
  onPaymentRefund: () => any;
  onPaymentVoid: () => any;
  onShippingAddressEdit: () => any;
  onOrderCancel: () => any;
  onNoteAdd: (data: HistoryFormData) => any;
  onNoteUpdate: (id: string, message: string) => Promise<FetchResult<OrderNoteUpdateMutation>>;
  onNoteUpdateLoading: boolean;
  onProfileView: () => any;
  onOrderReturn: () => any;
  onInvoiceClick: (invoiceId: string) => any;
  onInvoiceGenerate: () => any;
  onInvoiceSend: (invoiceId: string) => any;
  onTransactionAction: (transactionId: string, actionType: TransactionActionEnum) => any;
  onAddManualTransaction: () => any;
  onRefundAdd: () => void;
  onSubmit: (data: MetadataIdSchema) => Promise<any>;
}

const OrderExchangeRequestsCard: React.FC<{
  order: OrderDetailsFragment;
  onRefresh: () => void;
}> = ({ order, onRefresh }) => {
  const notify = useNotifier();

  // Mutation Hook
  const [updateStatus, { loading }] = useOrderExchangeUpdateStatusMutation({
    onCompleted: data => {
      if (data.orderExchangeRequestUpdate?.orderErrors.length === 0) {
        notify({ status: "success", text: "교환 상태가 업데이트되었습니다." });
        onRefresh();
      } else {
        notify({
          status: "error",
          text: "실패: " + data.orderExchangeRequestUpdate?.orderErrors[0].message,
        });
      }
    },
    onError: () => notify({ status: "error", text: "오류 발생" }),
  });

  if (!order || !order.exchanges || order.exchanges.length === 0) return null;

  const handleStatusChange = (exchangeId: string, newStatus: string) => {
    updateStatus({
      variables: {
        id: exchangeId,
        status: newStatus as OrderExchangeStatusEnum,
      },
    });
  };

  return (
    // DashboardCard 대신 MUI Card 사용 (스타일 통일성을 위해 DashboardCard를 써도 됨)
    <Card style={{ marginBottom: "24px" }}>
      <CardContent>
        {/* 타이틀 */}
        <Typography variant="h5" component="h2" style={{ marginBottom: "16px", fontWeight: 600 }}>
          교환 신청 내역 (Exchange Requests)
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>신청일</TableCell>
              <TableCell>상태 변경</TableCell>
              <TableCell>사유</TableCell>
              <TableCell>상품 / 수량</TableCell>
              <TableCell>증빙 사진</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.exchanges.map(ex => (
              <TableRow key={ex.id}>
                <TableCell>{new Date(ex.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {/* MUI Select 사용 */}
                  <Select
                    value={ex.status}
                    onChange={e => handleStatusChange(ex.id, e.target.value as string)}
                    variant="outlined"
                    margin="dense"
                    disabled={loading}
                    style={{ minWidth: "120px", fontSize: "14px" }}
                  >
                    <MenuItem value={OrderExchangeStatusEnum.PENDING}>검토 대기</MenuItem>
                    <MenuItem value={OrderExchangeStatusEnum.APPROVED}>승인됨</MenuItem>
                    <MenuItem value={OrderExchangeStatusEnum.REJECTED}>반려됨</MenuItem>
                    <MenuItem value={OrderExchangeStatusEnum.COMPLETED}>완료</MenuItem>
                  </Select>
                </TableCell>
                <TableCell style={{ maxWidth: "250px", wordBreak: "keep-all" }}>
                  {ex.reason}
                </TableCell>
                <TableCell>
                  {ex.lines?.map((line, idx) => (
                    <div key={idx} style={{ fontSize: "13px", marginBottom: "4px" }}>
                      • {line.orderLine?.productName} <b>x {line.quantity}</b>
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {ex.images?.map((img, i) => (
                      <a
                        key={i}
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "block", border: "1px solid #eee", borderRadius: "4px" }}
                      >
                        <img
                          src={img.url}
                          alt="evidence"
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </a>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const OrderDetailsPage: React.FC<OrderDetailsPageProps> = props => {
  const {
    loading,
    order,
    shop,
    saveButtonBarState,
    errors,
    onBillingAddressEdit,
    onFulfillmentApprove,
    onFulfillmentCancel,
    onFulfillmentTrackingNumberUpdate,
    // onNoteAdd,
    // onNoteUpdate,
    // onNoteUpdateLoading,
    onOrderCancel,
    onOrderFulfill,
    onPaymentCapture,
    onPaymentRefund,
    onPaymentVoid,
    onShippingAddressEdit,
    onProfileView,
    // onInvoiceClick,
    // onInvoiceGenerate,
    // onInvoiceSend,
    onOrderReturn,
    onOrderLineAdd,
    onOrderLineChange,
    onOrderLineRemove,
    onShippingMethodEdit,
    onTransactionAction,
    onAddManualTransaction,
    onShowMetadata,
    onMarkAsPaid,
    onRefundAdd,
    onSubmit,
  } = props;
  const navigate = useNavigator();
  const intl = useIntl();
  const notify = useNotifier();
  const location = useLocation();

  const [updateDeliveryStatus, { loading: updateDeliveryStatusLoading }] = useMutation<
    OrderFulfillmentUpdateDeliveryStatusMutation,
    OrderFulfillmentUpdateDeliveryStatusMutationVariables
  >(OrderFulfillmentUpdateDeliveryStatusDocument, {
    onCompleted: data => {
      if (data.orderFulfillmentUpdateDeliveryStatus?.errors.length === 0) {
        notify({
          status: "success",
          text: "배송 상태가 성공적으로 업데이트되었습니다.",
        });
      } else {
        notify({
          status: "error",
          text: "배송 상태 업데이트에 실패했습니다.",
        });
      }
    },
    refetchQueries: ["OrderDetails"],
  });

  const handleOrderUpdate = () => {
    window.location.reload();
  };

  const isOrderUnconfirmed = order?.status === OrderStatus.UNCONFIRMED;
  const canCancel = order?.status !== OrderStatus.CANCELED;
  const canEditAddresses = order?.status !== OrderStatus.CANCELED;
  const canFulfill = order?.status !== OrderStatus.CANCELED;
  const notAllowedToFulfillUnpaid =
    shop?.fulfillmentAutoApprove && !shop?.fulfillmentAllowUnpaid && !order?.isPaid;
  const unfulfilled = (order?.lines || []).filter(line => line.quantityToFulfill > 0);

  // ✅ 1. Savebar 버튼 클릭 시 호출될 핸들러를 직접 생성
  const handleSave = async () => {
    const data = createOrderMetadataIdSchema(order);
    const result = await onSubmit(data);

    // 기존 handleSubmit의 에러 처리 로직을 그대로 사용 가능 (선택 사항)
    getMutationErrors(result);
  };

  const saveLabel = isOrderUnconfirmed
    ? { confirm: intl.formatMessage(messages.confirmOrder) }
    : undefined;
  const allowSave = () => {
    if (!isOrderUnconfirmed) {
      return loading;
    } else if (!order?.lines?.length) {
      return true;
    }
    return loading;
  };

  const selectCardMenuItems = filteredConditionalItems([
    {
      item: {
        label: "주문취소",
        onSelect: onOrderCancel,
      },
      shouldExist: canCancel,
    },
    {
      item: {
        label: intl.formatMessage(messages.returnOrder),
        onSelect: onOrderReturn,
      },
      shouldExist: hasAnyItemsReplaceable(order),
    },
  ]);
  const { ORDER_DETAILS_MORE_ACTIONS, ORDER_DETAILS_WIDGETS } = useExtensions(
    extensionMountPoints.ORDER_DETAILS,
  );
  const extensionMenuItems = getExtensionsItemsForOrderDetails(
    ORDER_DETAILS_MORE_ACTIONS,
    order?.id,
  );
  const context = useDevModeContext();
  const openPlaygroundURL = () => {
    context.setDevModeContent(defaultGraphiQLQuery);
    context.setVariables(`{ "id": "${order?.id}" }`);
    context.setDevModeVisibility(true);
  };

  const previousUrl = (location.state as { from?: string })?.from || orderListUrl();
  const backLinkUrl = useBackLinkWithState({
    path: previousUrl,
  });

  return (
    <DetailPageLayout>
      <TopNav href={backLinkUrl} title={<Title order={order} />}>
        <TopNav.Menu dataTestId="menu" items={[...selectCardMenuItems, ...extensionMenuItems]} />
      </TopNav>

      <DetailPageLayout.Content data-test-id="order-fulfillment">
        {!isOrderUnconfirmed ? (
          <OrderUnfulfilledProductsCard
            order={order}
            showFulfillmentAction={canFulfill}
            notAllowedToFulfillUnpaid={notAllowedToFulfillUnpaid}
            lines={unfulfilled}
            onFulfill={onOrderFulfill}
            loading={loading}
            onShowMetadata={onShowMetadata}
          />
        ) : (
          <>
            <OrderDraftDetails
              order={order}
              errors={errors}
              loading={loading}
              onShowMetadata={onShowMetadata}
              onOrderLineAdd={onOrderLineAdd}
              onOrderLineChange={onOrderLineChange}
              onOrderLineRemove={onOrderLineRemove}
              onShippingMethodEdit={onShippingMethodEdit}
            />
            <CardSpacer />
          </>
        )}

        <OrderExchangeRequestsCard order={order} onRefresh={handleOrderUpdate} />

        {order?.fulfillments
          ?.filter(f => f.status !== FulfillmentStatus.CANCELED) // 👈 필터 추가
          ?.map(fulfillment => (
            <OrderFulfilledProductsCard
              dataTestId="fulfilled-order-section"
              key={fulfillment.id}
              fulfillment={fulfillment}
              fulfillmentAllowUnpaid={shop?.fulfillmentAllowUnpaid}
              order={order}
              onShowMetadata={onShowMetadata}
              onOrderFulfillmentCancel={() => onFulfillmentCancel(fulfillment.id)}
              onTrackingCodeAdd={() => onFulfillmentTrackingNumberUpdate(fulfillment.id)}
              onOrderFulfillmentApprove={() => onFulfillmentApprove(fulfillment.id)}
              onOrderUpdate={handleOrderUpdate}
              onDeliveryStatusUpdate={updateDeliveryStatus}
              deliveryStatusUpdateLoading={updateDeliveryStatusLoading}
            />
          ))}
        <OrderPaymentOrTransaction
          order={order}
          shop={shop}
          onTransactionAction={onTransactionAction}
          onPaymentCapture={onPaymentCapture}
          onPaymentVoid={onPaymentVoid}
          onPaymentRefund={onPaymentRefund}
          onMarkAsPaid={onMarkAsPaid}
          onAddManualTransaction={onAddManualTransaction}
          onRefundAdd={onRefundAdd}
        />
        {/* 주석 처리된 Metadata 및 OrderHistory 등은 그대로 유지 */}
      </DetailPageLayout.Content>
      <DetailPageLayout.RightSidebar>
        <OrderCustomer
          canEditAddresses={canEditAddresses}
          canEditCustomer={false}
          order={order}
          errors={errors}
          onBillingAddressEdit={onBillingAddressEdit}
          onShippingAddressEdit={onShippingAddressEdit}
          onProfileView={onProfileView}
        />
        <CardSpacer />
        <OrderCustomerNote note={maybe(() => order.customerNote)} />
        {ORDER_DETAILS_WIDGETS.length > 0 && order?.id && (
          <>
            <CardSpacer />
            <Divider />
            <AppWidgets extensions={ORDER_DETAILS_WIDGETS} params={{ orderId: order.id }} />
          </>
        )}
      </DetailPageLayout.RightSidebar>
      <Savebar>
        <Savebar.Spacer />
        <Savebar.CancelButton onClick={() => navigate(previousUrl)} />
        {/* ✅ 3. ConfirmButton의 onClick에 새로 만든 handleSave 함수를 직접 연결 */}
        <Savebar.ConfirmButton
          transitionState={saveButtonBarState}
          onClick={handleSave}
          disabled={allowSave()}
        >
          {saveLabel?.confirm}
        </Savebar.ConfirmButton>
      </Savebar>
    </DetailPageLayout>
  );
};

OrderDetailsPage.displayName = "OrderDetailsPage";
export default OrderDetailsPage;
