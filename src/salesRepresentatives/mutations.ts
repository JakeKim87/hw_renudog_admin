import { gql } from "@apollo/client";

export const salesRepresentativeCreateMutation = gql`
  mutation SalesRepresentativeCreate($input: SalesRepresentativeInput!) {
    salesRepresentativeCreate(input: $input) {
      salesRepresentative {
        id
        name
      }
      errors {
        ...AccountError
      }
    }
  }
`;

export const salesRepresentativeUpdateMutation = gql`
  mutation SalesRepresentativeUpdate($id: ID!, $input: SalesRepresentativeInput!) {
    salesRepresentativeUpdate(id: $id, input: $input) {
      salesRepresentative {
        id
        name
        phoneNumber
        email
      }
      errors {
        ...AccountError
      }
    }
  }
`;

export const salesRepresentativeDeleteMutation = gql`
  mutation SalesRepresentativeDelete($id: ID!) {
    salesRepresentativeDelete(id: $id) {
      salesRepresentative {
        id
      }
      errors {
        ...AccountError
      }
    }
  }
`;