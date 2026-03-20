import { gql } from "@apollo/client";

export const depositHistoryFragment = gql`
  fragment DepositHistory on DepositHistory {
    id
    createdAt
    amount
    balanceAfterTransaction
    reason
    status
    paymentMethodName
    user {
      ...Customer
    }
    order {
      id
      number
    }
  }
`;