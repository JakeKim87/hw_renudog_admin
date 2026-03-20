import { gql } from "@apollo/client";

export const membershipTierCreateMutation = gql`
  mutation MembershipTierCreate($input: MembershipTierInput!) {
    membershipTierCreate(input: $input) {
      membershipTier {
        id
        grade
      }
      errors {
        ...MembershipTierError
      }
    }
  }
`;

export const membershipTierUpdateMutation = gql`
  mutation MembershipTierUpdate($id: ID!, $input: MembershipTierInput!) {
    membershipTierUpdate(id: $id, input: $input) {
      membershipTier {
        id
        grade
        withoutQ
        withQ
        preserve
        earningRate
      }
      errors {
        ...MembershipTierError
      }
    }
  }
`;

export const membershipTierDeleteMutation = gql`
  mutation MembershipTierDelete($id: ID!) {
    membershipTierDelete(id: $id) {
      membershipTier {
        id
      }
      errors {
        ...MembershipTierError
      }
    }
  }
`;