import { gql } from "@apollo/client";

export const eventsQuery = gql`
  query Events($first: Int, $after: String, $last: Int, $before: String, $sortBy: EventSortingInput) {
    events(first: $first, after: $after, last: $last, before: $before, sortBy: $sortBy) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
      edges {
        node {
          ...Event
        }
      }
    }
  }
`;

export const eventDetailsQuery = gql`
  query EventDetails($id: ID!) {
    event(id: $id) {
      ...Event
    }
  }
`;

export const eventSubmissionsQuery = gql`
  query EventSubmissions(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $filter: EventSubmissionFilterInput
    $sortBy: EventSubmissionSortingInput
  ) {
    eventSubmissions(
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
          ...EventSubmission
        }
      }
    }
  }
`;

export const eventSubmissionDetailsQuery = gql`
  query EventSubmissionDetails($id: ID!) {
    eventSubmission(id: $id) {
      ...EventSubmission
    }
  }
`;
