import { gql } from "@apollo/client";

export const salesRepresentativesQuery = gql`
  query SalesRepresentatives {
    salesRepresentatives(first: 100) { # 필요에 따라 개수 조정
      edges {
        node {
          ...SalesRepresentative
        }
      }
    }
  }
`;

export const salesRepresentativeDetailsQuery = gql`
  query SalesRepresentativeDetails($id: ID!) {
    salesRepresentative(id: $id) {
      ...SalesRepresentative
    }
  }
`;