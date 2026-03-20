import { gql } from "@apollo/client";

export const membershipTierFragment = gql`
  fragment MembershipTier on MembershipTierType {
    id
    grade
    withoutQ
    withQ
    preserve
    earningRate
    withoutQDiscountRate
    withQDiscountRate
    preserveDiscountRate
    tokenDiscountRate
  }
`;

export const membershipTierError = gql`
  fragment MembershipTierError on MembershipTierError {
    field
    message
    code
  }
`;