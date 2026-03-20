import { gql } from "@apollo/client";

export const noticesQuery = gql`
  query Notices(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $sortBy: NoticeSortingInput
  ) {
    notices(
      first: $first
      after: $after
      last: $last
      before: $before
      sortBy: $sortBy
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
      edges {
        node {
          ...Notice
        }
      }
    }
  }
`;

export const noticeDetailsQuery = gql`
  query NoticeDetails($id: ID!) {
    notice(id: $id) {
      ...Notice
    }
  }
`;