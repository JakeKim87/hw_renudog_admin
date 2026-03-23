import { gql } from "@apollo/client";

export const orderListQuery = gql`
  query OrderList(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $filter: OrderFilterInput
    $sort: OrderSortingInput
  ) {
    orders(
      before: $before
      after: $after
      first: $first
      last: $last
      filter: $filter
      sortBy: $sort
    ) {
      edges {
        node {
          __typename
          billingAddress {
            ...Address
          }
          channel {
            name
            id
          }
          created
          id
          number
          paymentStatus
          status
          total {
            __typename
            gross {
              __typename
              amount
              currency
            }
          }
          userEmail
          user {
            id
            email
            businessName
          }
          chargeStatus
          fulfillments {
            id
            deliveryStatus
            created
          }
          lines {
            id
            quantity
            quantityToFulfill
            allocations {
              warehouse {
                id
              }
            }
          }
          payments {
            id
            gateway
            paymentMethodType
            chargeStatus
            creditCard {
              brand
              lastDigits
            }
            created
            modified
          }
          metadata {
            key
            value
          }
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`;
export const orderDraftListQuery = gql`
  query OrderDraftList(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $filter: OrderDraftFilterInput
    $sort: OrderSortingInput
  ) {
    draftOrders(
      before: $before
      after: $after
      first: $first
      last: $last
      filter: $filter
      sortBy: $sort
    ) {
      edges {
        node {
          __typename
          billingAddress {
            ...Address
          }
          created
          channel {
            name
            id
          }
          id
          number
          paymentStatus
          status
          total {
            __typename
            gross {
              __typename
              amount
              currency
            }
          }
          userEmail
          user {
            id
            email
            businessName
          }
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`;

export const orderDetailsQuery = gql`
  query OrderDetails($id: ID!) {
    order(id: $id) {
      ...OrderDetails
    }
    shop {
      countries {
        code
        country
      }
      defaultWeightUnit
      fulfillmentAllowUnpaid
      fulfillmentAutoApprove
      availablePaymentGateways {
        ...PaymentGateway
      }
    }
  }
`;

export const orderDetailsWithMetadataQuery = gql`
  query OrderDetailsWithMetadata($id: ID!, $hasManageProducts: Boolean!) {
    order(id: $id) {
      ...OrderDetailsWithMetadata
    }
    shop {
      countries {
        code
        country
      }
      defaultWeightUnit
      fulfillmentAllowUnpaid
      fulfillmentAutoApprove
      availablePaymentGateways {
        ...PaymentGateway
      }
    }
  }
`;

export const orderLinesMetadata = gql`
  query OrderLinesMetadata($id: ID!, $hasManageProducts: Boolean!) {
    order(id: $id) {
      lines {
        ...OrderLineMetadataDetails
      }
    }
  }
`;

export const orderDetailsGrantedRefund = gql`
  query OrderDetailsGrantRefund($id: ID!) {
    order(id: $id) {
      ...OrderDetailsGrantRefund
    }
  }
`;

export const orderDetailsGrantedRefundEdit = gql`
  query OrderDetailsGrantRefundEdit($id: ID!) {
    order(id: $id) {
      ...OrderDetailsGrantRefund
    }
  }
`;

export const orderFulfillData = gql`
  query OrderFulfillData($orderId: ID!) {
    order(id: $orderId) {
      id
      isPaid
      deliveryMethod {
        __typename
        ... on ShippingMethod {
          id
        }
        ... on Warehouse {
          id
          clickAndCollectOption
        }
      }
      lines {
        ...OrderFulfillLine
      }
      number
    }
  }
`;

export const orderFulfillSettingsQuery = gql`
  query OrderFulfillSettings {
    shop {
      ...ShopOrderSettings
    }
  }
`;

export const orderSettingsQuery = gql`
  query OrderSettings {
    orderSettings {
      ...OrderSettings
    }
    shop {
      ...ShopOrderSettings
    }
  }
`;
export const orderRefundData = gql`
  query OrderRefundData($orderId: ID!) {
    order(id: $orderId) {
      id
      number
      total {
        gross {
          ...Money
        }
      }
      totalCaptured {
        ...Money
      }
      shippingPrice {
        gross {
          ...Money
        }
      }
      lines {
        ...RefundOrderLine
        quantityToFulfill
      }
      fulfillments {
        id
        status
        fulfillmentOrder
        lines {
          id
          quantity
          orderLine {
            ...RefundOrderLine
          }
        }
      }
    }
  }
`;

export const orderTransactionsData = gql`
  query OrderTransactionsData($orderId: ID!) {
    order(id: $orderId) {
      id
      transactions {
        ...TransactionItem
      }
      total {
        gross {
          ...Money
        }
      }
    }
  }
`;

export const channelUsabilityData = gql`
  query ChannelUsabilityData($channel: String!) {
    products(channel: $channel) {
      totalCount
    }
  }
`;

export const defaultGraphiQLQuery = /* GraphQL */ `
  query OrderDetailsGraphiQL($id: ID!) {
    order(id: $id) {
      id
      number
      status
      isShippingRequired
      canFinalize
      created
      customerNote
      paymentStatus
      userEmail
      isPaid
    }
  }
`;

export const DevModeQuery = /* GraphQL */ `
  query DevModeRun($filter: OrderFilterInput, $sortBy: OrderSortingInput) {
    orders(first: 10, filter: $filter, sortBy: $sortBy) {
      edges {
        node {
          id
          number
          status
          isShippingRequired
          canFinalize
          created
          customerNote
          paymentStatus
          userEmail
          isPaid
        }
      }
    }
  }
`;
export const orderExportQuery = gql`
  query OrderExport(
    $filter: OrderFilterInput
    $sort: OrderSortingInput
    $after: String
    $first: Int
  ) {
    orders(first: $first, filter: $filter, sortBy: $sort, after: $after) {
      edges {
        node {
          # 엑셀에 필요한 필드만 포함시킵니다.
          number
          created
          userEmail
          user {
            businessName
          }
          total {
            gross {
              amount
            }
          }
          status
          paymentStatus
          totalCharged {
            amount
          }
          pointsUsed
          depositUsed
          surgeryDate
          receiptRequiredDate
          shippingAddress {
            firstName
            lastName
            phone
            postalCode
            streetAddress1
            streetAddress2
          }
          fulfillments {
            id
            deliveryStatus
            created
            trackingNumber
          }
          lines {
            id
            quantity
            productName
            variantName
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
export const categoryListForFilteringQuery = gql`
  query CategoryListForFiltering($first: Int!) {
    categories(first: $first, sortBy: { field: NAME, direction: ASC }) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const orderLineVariantSwap = gql`
  mutation OrderLineVariantSwap($id: ID!, $input: [OrderLineSwapInput!]!) {
    orderLineVariantSwap(id: $id, input: $input) {
      orderLines {
        id
      }
      errors {
        field
        message
      }
    }
  }
`;

export const orderDetailsByDateRange = gql`
  query OrderDetailsByDateRange($channel: String!, $createdAfter: Date!) {
    orders(
      first: 100
      channel: $channel
      filter: { created: { gte: $createdAfter } }
      sortBy: { field: CREATED_AT, direction: ASC }
    ) {
      edges {
        node {
          id
          status
          paymentStatus
          created
          total {
            gross {
              amount
            }
          }
          lines {
            quantity
            productName
            variantName
          }
        }
      }
    }
  }
`;

export const trackingCompanyListQuery = gql`
  query TrackingCompanyList {
    trackingCompanies {
      code
      name
    }
  }
`;

export const exchangeVariantSearch = gql`
  query ExchangeVariantSearch($categoryId: ID!, $channel: String) {
    products(filter: { categories: [$categoryId] }, channel: $channel, first: 50) {
      edges {
        node {
          id
          name
          variants {
            id
            name
            sku
            quantityAvailable
            product {
              id
              name
            }
            pricing {
              price {
                gross {
                  amount
                  currency
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const bonusVariantSearch = gql`
  query BonusVariantSearch($channel: String, $search: String) {
    products(channel: $channel, search: $search, first: 50) {
      edges {
        node {
          id
          name
          variants {
            id
            name
            sku
            quantityAvailable
            product {
              id
              name
            }
          }
        }
      }
    }
  }
`;
