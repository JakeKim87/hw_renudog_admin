import { gql } from "@apollo/client";

export const customerList = gql`
  query ListCustomers(
    $after: String
    $before: String
    $first: Int
    $last: Int
    $filter: CustomerFilterInput
    $sort: UserSortingInput
    $PERMISSION_MANAGE_ORDERS: Boolean!
  ) {
    customers(
      after: $after
      before: $before
      first: $first
      last: $last
      filter: $filter
      sortBy: $sort
    ) {
      edges {
        node {
          ...Customer
          orders @include(if: $PERMISSION_MANAGE_ORDERS) {
            totalCount
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const customerDetails = gql`
  query CustomerDetails(
    $id: ID!
    $PERMISSION_MANAGE_ORDERS: Boolean!
    $PERMISSION_MANAGE_STAFF: Boolean!
  ) {
    user(id: $id) {
      ...CustomerDetails
      metadata {
        ...MetadataItem
      }
      privateMetadata @include(if: $PERMISSION_MANAGE_STAFF) {
        ...MetadataItem
      }
      orders(first: 5) @include(if: $PERMISSION_MANAGE_ORDERS) {
        edges {
          node {
            id
            created
            number
            paymentStatus
            total {
              gross {
                currency
                amount
              }
            }
            chargeStatus
          }
        }
      }
      lastPlacedOrder: orders(first: 1) @include(if: $PERMISSION_MANAGE_ORDERS) {
        edges {
          node {
            id
            created
          }
        }
      }
    }
    membershipTiers {
      ...MembershipTier
    }
    salesRepresentatives(first: 100) {
      edges {
        node {
          ...SalesRepresentative
        }
      }
    }
  }
`;

export const customerAddresses = gql`
  query CustomerAddresses($id: ID!) {
    user(id: $id) {
      ...CustomerAddresses
    }
  }
`;

export const customerCreateData = gql`
  query CustomerCreateData {
    shop {
      countries {
        code
        country
      }
    }
  }
`;

export const CustomerDepositHistory = gql`
  query CustomerDepositHistory($id: ID!, $first: Int, $after: String, $before: String, $last: Int) {
    user(id: $id) {
      ...CustomerDetails
      depositHistories(first: $first, after: $after, before: $before, last: $last) {
        edges {
          node {
            id
            createdAt
            reason
            amount
            balanceAfterTransaction
            paymentOrderId
            paymentKey
            paymentMethodName
          }
        }
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
      }
    }
  }
`;

export const CustomerPointHistory = gql`
  query CustomerPointHistory($id: ID!, $first: Int, $after: String, $before: String, $last: Int) {
    user(id: $id) {
      ...CustomerDetails
      pointHistories(first: $first, after: $after, before: $before, last: $last) {
        edges {
          node {
            id
            createdAt
            reason
            points
            balanceAfterTransaction
            order {
              id
              number
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
      }
    }
  }
`;