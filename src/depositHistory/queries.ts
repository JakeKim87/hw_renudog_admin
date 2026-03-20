import { gql } from "@apollo/client";

// 만약 DepositHistory 프래그먼트 파일이 따로 있다면 import 해야 합니다.
// import { depositHistoryFragment } from "./fragments"; 

export const depositHistoryList = gql`
  query ListAllDepositHistories(
    $after: String
    $before: String
    $first: Int
    $last: Int
    $filter: DepositHistoryFilterInput
  ) {
    allDepositHistories(
      after: $after
      before: $before
      first: $first
      last: $last
      filter: $filter
    ) {
      edges {
        node {
          ...DepositHistory
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      totalCount
    }
  }
`;