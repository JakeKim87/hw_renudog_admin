import { gql } from "@apollo/client";

export const customerFragment = gql`
  fragment Customer on User {
    id
    email
    firstName
    lastName
    businessName
    representativeName
    businessPhone
    isActive
    membership {
      tier {
        id
        grade
      }
    }
  }
`;

export const customerDetailsFragment = gql`
  fragment CustomerDetails on User {
    ...Customer
    businessRegistrationNumber
    departmentName
    managerName
    managerContact
    businessAddress {
      ...Address
    }
    dateJoined
    lastLogin
    defaultShippingAddress {
      ...Address
    }
    defaultBillingAddress {
      ...Address
    }
    note
    pointWallet {
      balance
    }
    depositWallet {
      balance
    }
    cashWallet {
      id
      balance
      updatedAt
    }
    membership {
      tier {
        id
        grade
      }
    }
    salesRepresentative {
      id
      name
    }
    documents {
      id
      fileUrl
      fileName
      uploadedAt
    }
    isActive
  }
`;

export const customerAddressesFragment = gql`
  fragment CustomerAddresses on User {
    ...Customer
    addresses {
      ...Address
    }
    defaultBillingAddress {
      id
    }
    defaultShippingAddress {
      id
    }
  }
`;
