// src/membershipTiers/queries.ts

import { gql } from "@apollo/client";

// 필터, 정렬, 페이지네이션 인자가 모두 제거된 단순한 쿼리입니다.
export const membershipTiersQuery = gql`
  query MembershipTiers {
    membershipTiers {
      ...MembershipTier
    }
  }
`;

export const membershipTierDetailsQuery = gql`
  query MembershipTierDetails($id: ID!) {
    membershipTier(id: $id) {
      ...MembershipTier
    }
  }
`;