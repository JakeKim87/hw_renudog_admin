import { CustomerListUrlQueryParams } from "@dashboard/customers/urls";
import { CustomerFilterInput } from "@dashboard/graphql";

/**
 * URL 파라미터를 받아 GraphQL 쿼리에 필요한 필터 변수를 생성합니다.
 * @param params URL 쿼리 파라미터 객체
 * @returns CustomerFilterInput 타입의 객체
 */
export function getFilterVariables(params: CustomerListUrlQueryParams): CustomerFilterInput {
  
  const membershipTierFilter = params.membershipTier
    ? [params.membershipTier] // 단일 string을 string 배열로 감쌉니다.
    : undefined;


  return {
    search: params.query,
    isActive: params.isActive === undefined ? undefined : params.isActive === "true",
    membershipTier: membershipTierFilter,
  };
}