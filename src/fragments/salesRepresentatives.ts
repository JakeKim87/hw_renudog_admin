import { gql } from "@apollo/client";

export const salesRepresentativeFragment = gql`
  fragment SalesRepresentative on SalesRepresentative {
    id
    name
    phoneNumber
    email
  }
`;