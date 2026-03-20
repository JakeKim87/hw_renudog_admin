import { DashboardCard } from "@dashboard/components/Card";
import HorizontalSpacer from "@dashboard/components/HorizontalSpacer";
import Money from "@dashboard/components/Money";
import { OrderDetailsFragment } from "@dashboard/graphql";
import { getDiscountTypeLabel } from "@dashboard/orders/utils/data";
import { Link } from "@material-ui/core";
import { Divider, Skeleton, sprinkles } from "@saleor/macaw-ui-next";
import clsx from "clsx";
import React, { useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { OrderPaymentStatusPill } from "../OrderPaymentSummaryCard/components/OrderPaymentStatusPill";
import { orderPaymentMessages } from "./messages";
import { useStyles } from "./styles";
import {
  extractRefundedAmount,
  getDiscountAmount,
} from "./utils";


interface OrderPaymentProps {
  order: OrderDetailsFragment | undefined | null;
  onCapture: () => void;
  onMarkAsPaid: () => void;
  onRefund: () => void;
  onVoid: () => void;
}

const OrderPayment: React.FC<OrderPaymentProps> = props => {
  const { order } = props;
  const classes = useStyles(props);
  const intl = useIntl();
  const refundedAmount = extractRefundedAmount(order);

  const paymentInfo = useMemo(() => {
    if (!order) {
      return null;
    }

    // 메타데이터에서 토큰 결제 여부를 확인
    const isTokenPaymentMeta = order.metadata.find(
      meta => meta.key === "type" && meta.value === "TOKEN_PAYMENT",
    );

    if (isTokenPaymentMeta) {
      const gnoAmountMeta = order.metadata.find(m => m.key === "finalGnoAmount");
      const txHashMeta = order.metadata.find(m => m.key === "transactionHash");

      return {
        isTokenPayment: true,
        gnoAmount: gnoAmountMeta?.value ?? "0",
        txHash: txHashMeta?.value ?? null,
        receiptUrl: null, // 토큰 결제는 별도 영수증 URL이 없음
      };
    }

    // 일반 결제인 경우, 영수증 URL을 찾음
    const receiptUrlMeta = order.metadata.find(item => item.key === "payment_receipt_url");

    return {
      isTokenPayment: false,
      gnoAmount: null,
      txHash: null,
      receiptUrl: receiptUrlMeta?.value ?? null,
    };
  }, [order]);

  // 블록 익스플로러 URL (환경 변수에서 가져오도록 설정)
  const blockExplorerUrl = process.env.BLOCKCHAIN_EXPLORER_URL || "https://sepolia.etherscan.io/tx/";

  const getDeliveryMethodName = (order: OrderDetailsFragment) => {
    if (
      order?.shippingMethodName === undefined &&
      order?.shippingPrice === undefined &&
      order?.collectionPointName === undefined
    ) {
      return <Skeleton />;
    }

    if (order.shippingMethodName === null) {
      return order.collectionPointName == null ? (
        <FormattedMessage {...orderPaymentMessages.shippingDoesNotApply} />
      ) : (
        <FormattedMessage {...orderPaymentMessages.clickAndCollectShippingMethod} />
      );
    }

    return order.shippingMethodName;
  };

  if (!order) {
    return (
      <DashboardCard>
        <DashboardCard.Header>
          <DashboardCard.Title>결제정보</DashboardCard.Title>
        </DashboardCard.Header>
        <DashboardCard.Content>
          <Skeleton />
        </DashboardCard.Content>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard data-test-id="OrderPayment">
      {/* ----- 상단 헤더 부분 (수정 없음) ----- */}
      <DashboardCard.Header>
        <DashboardCard.Title>
          결제정보
          <OrderPaymentStatusPill
            order={order}
            className={sprinkles({
              marginLeft: 2,
              marginRight: "auto",
            })}
          />
        </DashboardCard.Title>
        {/* <DashboardCard.Toolbar>
          {!order?.paymentStatus ? (
            <Skeleton />
          ) : (
            <div className={classes.titleContainer}>
              {order?.status !== OrderStatus.CANCELED &&
                (canCapture || canRefund || canVoid || canMarkAsPaid) && (
                  <div className={classes.actions}>
                    {canRefund && (
                      <Button variant="secondary" onClick={onRefund} data-test-id="refund-button">
                        환불
                      </Button>
                    )}
                  </div>
                )}
            </div>
          )}
        </DashboardCard.Toolbar> */}
      </DashboardCard.Header>

      {/* ----- 주문 금액 요약 부분 (수정 없음) ----- */}
      <DashboardCard.Content className={classes.payments}>
        <div className={classes.root}>
          {order?.discounts?.map(discount => (
            <div key={discount.id}>
              할인
              <HorizontalSpacer spacing={4} />
              <span className={classes.supportText}>{getDiscountTypeLabel(discount, intl)}</span>
              <span
                className={clsx(
                  classes.leftmostRightAlignedElement,
                  classes.smallFont,
                  classes.supportText,
                )}
              >
                소계에 포함됨
              </span>
              <HorizontalSpacer spacing={2} />
              <div className={classes.supportText}>
                <Money money={getDiscountAmount(discount.amount)} />
              </div>
            </div>
          ))}
          <div>
            부분 합계
            <div className={classes.leftmostRightAlignedElement}>
              {<Money money={order?.subtotal.gross} />}
            </div>
          </div>
          <div>
            배송
            <HorizontalSpacer spacing={4} />
            <div className={classes.supportText}>{getDeliveryMethodName(order)}</div>
            <div className={classes.leftmostRightAlignedElement}>
              {<Money money={order?.shippingPrice.gross} />}
            </div>
          </div>
          <div>
            세금
            {order?.total.tax.amount > 0 && (
              <>
                <div
                  className={clsx(
                    classes.supportText,
                    classes.smallFont,
                    classes.leftmostRightAlignedElement,
                  )}
                >
                  가격에 포함됨
                </div>
                <HorizontalSpacer spacing={2} />
              </>
            )}
            <div
              className={clsx(
                {
                  [classes.leftmostRightAlignedElement]: order?.total.tax.amount === 0,
                },
                classes.supportText,
              )}
            >
              {<Money money={order?.total.tax} />}
            </div>
          </div>
          <div className={classes.totalRow}>
            합계
            <div className={classes.leftmostRightAlignedElement}>
              {<Money money={order?.total.gross} />}
            </div>
          </div>
        </div>
      </DashboardCard.Content>

      <Divider />

      {/* ----- ✅✅✅ 결제 상세 내역 (이 부분이 핵심 수정 사항입니다) ✅✅✅ ----- */}
      <DashboardCard.Content className={classes.payments}>
        <div className={classes.root}>
          {/* 총 주문 금액 */}
          <div className={classes.totalRow}>
            <strong>총 주문 금액</strong>
            <div className={classes.leftmostRightAlignedElement}>
              <strong>{<Money money={order?.total.gross} />}</strong>
            </div>
          </div>

          {/* 결제 수단에 따른 조건부 표시 */}
          {paymentInfo?.isTokenPayment ? (
            <>
              {/* 토큰 결제 정보 */}
              <div>
                GNO 토큰 결제
                <div className={classes.leftmostRightAlignedElement}>
                  <strong>{paymentInfo.gnoAmount} GNO</strong>
                </div>
              </div>
              {paymentInfo.txHash && (
                <div>
                  트랜잭션 해시
                  <div className={classes.leftmostRightAlignedElement}>
                    <Link
                      href={`${blockExplorerUrl}${paymentInfo.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={paymentInfo.txHash}
                    >
                      {`${paymentInfo.txHash.substring(0, 6)}...${paymentInfo.txHash.substring(
                        paymentInfo.txHash.length - 4,
                      )}`}
                    </Link>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* 일반 PG 결제 정보 */}
              <div>
                실제 결제금액 (PG)
                <div className={classes.leftmostRightAlignedElement}>
                  {<Money money={order?.totalCharged} />}
                </div>
              </div>
              {order?.transactions?.[0]?.paymentMethodName && (
                <div>
                  결제 수단
                  <div className={classes.leftmostRightAlignedElement}>
                    {order.transactions[0].paymentMethodName}
                  </div>
                </div>
              )}
              {paymentInfo?.receiptUrl && (
                <div>
                  결제 영수증
                  <div className={classes.leftmostRightAlignedElement}>
                    <Link href={paymentInfo.receiptUrl} target="_blank" rel="noopener noreferrer">
                      영수증 보기
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 공통 표시 항목: 사용 포인트 */}
          {order.pointsUsed > 0 && (
            <div>
              사용 포인트
              <div className={classes.leftmostRightAlignedElement}>
                {order.pointsUsed?.toLocaleString()}P
              </div>
            </div>
          )}

          {/* 공통 표시 항목: 사용 예치금 */}
          {order.depositUsed > 0 && (
            <div>
              사용 예치금
              <div className={classes.leftmostRightAlignedElement}>
                {
                  <Money
                    money={{
                      amount: order.depositUsed,
                      currency: order?.total.gross.currency,
                    }}
                  />
                }
              </div>
            </div>
          )}

          {/* 공통 표시 항목: 환불액 */}
          {!!refundedAmount?.amount && (
            <div>
              환불된 금액
              <div className={classes.leftmostRightAlignedElement}>
                {<Money money={refundedAmount} />}
              </div>
            </div>
          )}
        </div>
      </DashboardCard.Content>
    </DashboardCard>
  );
};

OrderPayment.displayName = "OrderPayment";
export default OrderPayment;