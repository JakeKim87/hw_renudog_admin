import { gql } from "@apollo/client";

// --- 목록 조회 쿼리 ---
export const agencyTransferListQuery = gql`
  query AgencyTransferList(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $filter: AgencyTransferFilterInput
  ) {
    agencyTransfers(first: $first, after: $after, last: $last, before: $before, filter: $filter) {
      edges {
        node {
          ...AgencyTransfer
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

export const agencyTransferDetailsQuery = gql`
  query AgencyTransferDetails($id: ID!) {
    agencyTransfer(id: $id) {
      ...AgencyTransfer
    }
  }
`;
