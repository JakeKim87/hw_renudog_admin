// src/graphql/queries/Popup.ts

import { gql } from "@apollo/client";

export const popupsQuery = gql`
  query Popups(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $filter: PopupFilterInput
    $sortBy: PopupSortingInput
  ) {
    popups(
      first: $first
      after: $after
      last: $last
      before: $before
      filter: $filter
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
          ...Popup
        }
      }
    }
  }
`;

export const popupDetailsQuery = gql`
  query PopupDetails($id: ID!) {
    popup(id: $id) {
      ...Popup
    }
  }
`;