import { gql } from "@apollo/client";

export const updateCustomer = gql`
  mutation UpdateCustomer($id: ID!, $input: CustomerInput!) {
    customerUpdate(id: $id, input: $input) {
      errors {
        ...AccountError
      }
      user {
        ...CustomerDetails
      }
    }
  }
`;

export const createCustomer = gql`
  mutation CreateCustomer($input: UserCreateInput!) {
    customerCreate(input: $input) {
      errors {
        ...AccountError
      }
      user {
        id
      }
    }
  }
`;

export const removeCustomer = gql`
  mutation RemoveCustomer($id: ID!) {
    customerDelete(id: $id) {
      errors {
        ...AccountError
      }
    }
  }
`;

export const setCustomerDefaultAddress = gql`
  mutation SetCustomerDefaultAddress($addressId: ID!, $userId: ID!, $type: AddressTypeEnum!) {
    addressSetDefault(addressId: $addressId, userId: $userId, type: $type) {
      errors {
        ...AccountError
      }
      user {
        ...CustomerAddresses
      }
    }
  }
`;

export const createCustomerAddress = gql`
  mutation CreateCustomerAddress($id: ID!, $input: AddressInput!) {
    addressCreate(userId: $id, input: $input) {
      errors {
        ...AccountError
      }
      address {
        ...Address
      }
      user {
        ...CustomerAddresses
      }
    }
  }
`;

export const updateCustomerAddress = gql`
  mutation UpdateCustomerAddress($id: ID!, $input: AddressInput!) {
    addressUpdate(id: $id, input: $input) {
      errors {
        ...AccountError
      }
      address {
        ...Address
      }
    }
  }
`;

export const removeCustomerAddress = gql`
  mutation RemoveCustomerAddress($id: ID!) {
    addressDelete(id: $id) {
      errors {
        ...AccountError
      }
      user {
        ...CustomerAddresses
      }
    }
  }
`;

export const bulkRemoveCustomers = gql`
  mutation BulkRemoveCustomers($ids: [ID!]!) {
    customerBulkDelete(ids: $ids) {
      errors {
        ...AccountError
      }
    }
  }
`;

export const pointManage = gql`
  mutation PointManage($userId: ID!, $points: Int!, $reason: String!) {
  pointManage(userId: $userId, points: $points, reason: $reason) {
    pointWallet {
      id
      balance
    }
    pointSystemErrors {
      field
      message
      code
    }
  }
}
`;
export const depositManage = gql`
  mutation DepositManage($userId: ID!, $amount: Int!, $reason: String!) {
  depositManage(userId: $userId, amount: $amount, reason: $reason) {
    depositWallet {
      id
      balance
    }
    depositSystemErrors {
      field
      message
      code
    }
  }
}
`;

export const DepositCancel = gql`
  mutation DepositCancel($historyId: ID!) {
    depositCancel(historyId: $historyId) {
      errors {
        field
        message
        code
      }
    }
  }
`;

export const userMembershipUpdateMutation = gql`
  mutation UserMembershipUpdate($userId: ID!, $input: UserMembershipUpdateInput!) {
    userMembershipUpdate(userId: $userId, input: $input) {
      user {
        id
        membership {
          tier {
            id
            grade
          }
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const exchangeCancellationBulkCreate = gql`
  mutation ExchangeCancellationBulkCreate($file: Upload!, $userId: ID!) {
    exchangeCancellationBulkCreate(file: $file, userId: $userId) {
      createdCount
      exchangeCancellationErrors {
        field
        message
        code
        rowIndex
      }
    }
  }
`;

export const legacyOrderBulkCreate = gql`
  mutation LegacyOrderBulkCreate($file: Upload!, $userId: ID!) {
    legacyOrderBulkCreate(file: $file, userId: $userId) {
      createdCount
      legacyOrderErrors {
        field
        message
        code
        rowIndex
      }
    }
  }
`;

export const updateCustomerEmailByStaff = gql`
  mutation UpdateCustomerEmailByStaff($id: ID!, $email: String!) {
    accountEmailUpdateByStaff(id: $id, email: $email) {
      errors {
        ...AccountError
      }
      user {
        id
        email
      }
    }
  }
`;
