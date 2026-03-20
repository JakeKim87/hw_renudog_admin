import { gql } from "@apollo/client";

export const agencyTransferFragment = gql`
  fragment AgencyTransfer on AgencyTransfer {
    id
    number
    status
    createdAt
    trackingNumber
    carrier
    note
    adminNote
    agency {
      id
      email
      businessName
    }
    destinationAddress {
      id
      firstName
      lastName
      phone
      city
      postalCode
      streetAddress1
      streetAddress2
    }
    lines {
      id
      quantity
      productVariantName
    }
  }
`;
