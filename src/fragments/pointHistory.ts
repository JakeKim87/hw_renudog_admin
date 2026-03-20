import { gql } from "@apollo/client";

export const pointHistoryFragment = gql`
  fragment PointHistory on PointHistory {
    id
    createdAt
    points
    balanceAfterTransaction
    reason
    user {
      ...Customer
    }
    order {
      id
      number
    }
  }
`;
