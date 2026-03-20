import { gql } from "@apollo/client";

export const faqsQuery = gql`
  query Faqs(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $filter: FaqFilterInput
    $sortBy: FaqSortingInput
  ) {
    faqs(
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
          ...Faq
        }
      }
    }
    faqCategories {
      id
      name
    }
  }
`;
export const faqDetailsQuery = gql`
  query FaqDetails($id: ID!) {
    faq(id: $id) {
      ...Faq
    }
  }
`;