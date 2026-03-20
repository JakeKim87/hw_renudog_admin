import { gql } from "@apollo/client";

export const welcomePageActivities = gql`
  query WelcomePageActivities($hasPermissionToManageOrders: Boolean!) {
    activities: homepageEvents(last: 10) @include(if: $hasPermissionToManageOrders) {
      edges {
        node {
          ...Activities
        }
      }
    }
  }
`;

export const welcomePageAnalytics = gql`
  query WelcomePageAnalytics($channel: String!, $hasPermissionToManageOrders: Boolean!) {
    salesToday: ordersTotal(period: TODAY, channel: $channel)
      @include(if: $hasPermissionToManageOrders) {
      gross {
        amount
        currency
      }
    }
  }
`;

export const welcomePageNotifications = gql`
  query welcomePageNotifications($channel: String!) {
    productsOutOfStock: products(filter: { stockAvailability: OUT_OF_STOCK }, channel: $channel) {
      totalCount
    }
  }
`;

export const welcomePageNewUsers = gql`
  query WelcomePageNewUsers($hasPermissionToManageUsers: Boolean!) {
    customers(
      first: 0
      where: { isActive: false }
    ) @include(if: $hasPermissionToManageUsers) {
      totalCount
    }
  }
`;

export const welcomePageOrderStatusCounts = gql`
  query WelcomePageOrderStatusCounts($channel: String!, $hasPermissionToManageOrders: Boolean!) {
    unfulfilledOrders: orders(
      channel: $channel
      filter: { status: [UNFULFILLED] }
    ) @include(if: $hasPermissionToManageOrders) {
      totalCount
    }
    preparingOrders: orders(
      channel: $channel
      filter: {
        status: [FULFILLED]
        fulfillmentDeliveryStatus: [PREPARING]
      }
    ) @include(if: $hasPermissionToManageOrders) {
      totalCount
    }
    inTransitOrders: orders(
      channel: $channel
      filter: {
        status: [FULFILLED]
        fulfillmentDeliveryStatus: [IN_TRANSIT]
      }
    ) @include(if: $hasPermissionToManageOrders) {
      totalCount
    }
    deliveredOrders: orders(
      channel: $channel
      filter: {
        status: [FULFILLED]
        fulfillmentDeliveryStatus: [DELIVERED]
      }
    ) @include(if: $hasPermissionToManageOrders) {
      totalCount
    }
  }
`;
export const getSalesStatistics = gql`
  query GetSalesStatistics($channel: String!, $createdAfter: Date!) {
    salesStatistics(channelSlug: $channel, createdAfter: $createdAfter) {
      totalQuantity 
      totalAmount
      dailyStats {
        date
        totalQuantity
        totalAmount
      }
      productStats {
        productName
        variantName
        quantity
        totalAmount
      }
    }
  }
`;