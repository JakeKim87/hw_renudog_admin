import { CustomerListUrlSortField } from "@dashboard/customers/urls";
import { UserSortField } from "@dashboard/graphql";
import { createGetSortQueryVariables } from "@dashboard/utils/sort";

export function getSortQueryField(sort: CustomerListUrlSortField): UserSortField | undefined {
  switch (sort) {
    case CustomerListUrlSortField.businessName:
      return UserSortField.BUSINESS_NAME;
    case CustomerListUrlSortField.businessPhone:
      return UserSortField.BUSINESS_PHONE;
    case CustomerListUrlSortField.representativeName:
      return UserSortField.REPRESENTATIVE_NAME;
    case CustomerListUrlSortField.email:
      return UserSortField.EMAIL;
    case CustomerListUrlSortField.isActive:
        return UserSortField.IS_ACTIVE; 
    case CustomerListUrlSortField.membershipTier:
        return UserSortField.MEMBERSHIP_TIER; 
    default:
      return undefined;
  }
}

export const getSortQueryVariables = createGetSortQueryVariables(getSortQueryField);
