import { gql } from "@apollo/client";

export const pointHistoryList = gql`
  query ListAllPointHistories(
    $after: String
    $before: String
    $first: Int
    $last: Int
    $filter: PointHistoryFilterInput
  ) {
    allPointHistories(
      after: $after
      before: $before
      first: $first
      last: $last
      filter: $filter
    ) {
      edges {
        node {
          ...PointHistory
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