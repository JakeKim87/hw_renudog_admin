import { defineMessages } from "react-intl";

export const orderPaymentMessages = defineMessages({
  paymentTitle: {
    id: "1N8lSy",
    defaultMessage: "결제 요약", // Payments summary
    description: "Order summary payment header",
  },
  paymentSubtitle: {
    id: "iOOPMd",
    defaultMessage: "등록된 모든 거래의 결제 요약입니다.", // A summary of all payments from registered transactions
  },
  refundsTitle: {
    id: "E9Dz18",
    defaultMessage: "환불", // Refunds
    description: "Order summary refunds header",
  },
  authorized: {
    id: "IyV8CY",
    defaultMessage: "승인됨", // Authorized (결제 승인이 완료된 금액)
    description: "all authorized amount from transactions in order",
  },
  captured: {
    id: "egBBQ/",
    defaultMessage: "매출 확정", // Captured (실제로 청구된 금액)
    description: "all captured amount from transactions in order",
  },
  cancelled: {
    defaultMessage: "취소됨", // Cancelled
    id: "lrdAIY",
    description: "amount of all cancelled transactions in order",
  },
  pending: {
    defaultMessage: "대기중", // Pending
    id: "flnL3R",
    description: "sum of pending amount (any status) in order's transactions",
  },
  grantedRefund: {
    defaultMessage: "환불 승인됨", // Granted (환불 처리가 승인된 금액)
    id: "NPIBGp",
    description: "heading, sum of all granted refunds from transactions in order",
  },
  pendingRefund: {
    defaultMessage: "환불 대기중", // Pending (환불 처리가 아직 완료되지 않음)
    id: "IfiR4M",
    description: "heading, sum of all pending refunds from transactions in order",
  },
  refunded: {
    id: "hoii+4",
    defaultMessage: "환불 완료", // Refunded (실제 환불이 완료된 금액)
    description: "heading, sum of all completed refunds from transactions in order",
  },
  refundsExplanation: {
    id: "16sza6",
    defaultMessage:
      "환불 승인은 고객에게 반환될 금액을 예약하는 과정입니다. 이후 원래 결제 수단 또는 수동 거래를 통해 송금할 수 있습니다.",
    // "Refund grants reserve a money which later can be sent to customers via original payment methods or a manual transaction."
  },
  noPayments: {
    defaultMessage: "아직 결제 내역이 없습니다.", // This order has no payment yet.
    id: "T34dJq",
    description: "Displayed when order has no payment",
  },
  includedInSubtotal: {
    id: "pPef6L",
    defaultMessage: "소계에 포함됨", // Included in subtotal
    description: "order payment",
  },
  includedInPrices: {
    id: "ukYopn",
    defaultMessage: "가격에 포함됨", // Included in prices
    description: "order payment",
  },
  settled: {
    id: "Sxzua5",
    defaultMessage: "정산 완료", // Settled
    description: "order payment",
  },
});

export const orderPaymentActionButtonMessages = defineMessages({
  grantRefund: {
    defaultMessage: "환불 승인", // Grant refund
    id: "kWw0fr",
  },
  sendRefund: {
    defaultMessage: "환불금 보내기", // Send refund
    id: "2WenNh",
  },
  markAsPaid: {
    defaultMessage: "결제됨으로 표시", // Mark as paid
    id: "01+5kQ",
  },
});
