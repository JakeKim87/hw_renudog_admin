import { defineMessages } from "react-intl";

export const orderSummaryMessages = defineMessages({
  orderSummary: {
    defaultMessage: "주문 요약", // Order summary
    id: "cpnYcM",
    description: "Order summary card title",
  },
  clickAndCollectShippingMethod: {
    id: "ghGLbJ",
    defaultMessage: "매장 픽업", // click&collect
    description: "OrderPayment click&collect shipping method",
  },
  shippingDoesNotApply: {
    id: "uzAPCt",
    defaultMessage: "해당 없음", // does not apply
    description: "OrderPayment does not require shipping",
  },
  paymentTitle: {
    id: "SC/eNC",
    defaultMessage: "결제 상태", // Payment status
    description: "Payment card title",
  },
  subtotal: {
    id: "T8rvXs",
    defaultMessage: "소계", // Subtotal
    description: "order subtotal price",
  },
  itemCount: {
    id: "pr513b",
    defaultMessage: "{quantity}개 상품", // {quantity} items
    description: "ordered products",
  },
  taxes: {
    id: "r+dgiv",
    defaultMessage: "세금", // Taxes
  },
  vatIncluded: {
    id: "dJVXIb",
    defaultMessage: "부가세 포함", // VAT included
    description: "vat included in order price",
  },
  vatNotIncluded: {
    id: "5Jo3C5",
    defaultMessage: "해당 없음", // does not apply
    description: "vat not included in order price",
  },
  shipping: {
    id: "+CeEe3",
    defaultMessage: "배송비", // Shipping
    description: "order shipping method name",
  },
  shippingNotApplicable: {
    id: "Rsknyh",
    defaultMessage: "해당 없음", // does not apply
    description: "order does not require shipping",
  },
  discount: {
    id: "u0S2be",
    defaultMessage: "할인", // Discount
    description: "order discount",
  },
  total: {
    id: "zb4eBO",
    defaultMessage: "총 금액", // Total
    description: "order total price",
  },
  preauthorized: {
    id: "uUsZ7m",
    defaultMessage: "사전 승인 금액", // Preauthorized amount
    description: "order payment",
  },
  captured: {
    id: "V+gwx7",
    defaultMessage: "매출 확정 금액", // Captured amount
    description: "order payment",
  },
  refunded: {
    id: "q+gCyP",
    defaultMessage: "환불된 금액", // Refunded amount
    description: "order payment",
  },
  outstanding: {
    id: "5te3Tp",
    defaultMessage: "미결제 금액", // Outstanding Balance
    description: "order payment",
  },
  negative: {
    defaultMessage: "마이너스", // minus
    id: "GcbFa9",
    description: "aria-label, negative money amount",
  },
});