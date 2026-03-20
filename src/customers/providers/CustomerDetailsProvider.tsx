// @ts-strict-ignore
import { ApolloQueryResult } from "@apollo/client";
import { CustomerDetailsQuery, MembershipTierFragment, SalesRepresentativeFragment, useCustomerDetailsQuery } from "@dashboard/graphql";
import { mapEdgesToItems } from "@dashboard/utils/maps";
import React, { createContext } from "react";

export interface CustomerDetailsProviderProps {
  id: string;
  children: React.ReactNode;
}

interface CustomerDetailsConsumerProps {
  customer: CustomerDetailsQuery | null;
  tiers: MembershipTierFragment[];
  reps: SalesRepresentativeFragment[];
  loading: boolean | null;
  refetch: (
    variables?: Partial<{ id: string }>,
  ) => Promise<ApolloQueryResult<CustomerDetailsQuery>>;
}

export const CustomerDetailsContext = createContext<CustomerDetailsConsumerProps>({
  customer: null,
  tiers: [],
  reps: [],
  loading: true,
  refetch: () => Promise.resolve(null),
});


export const CustomerDetailsProvider: React.FC<CustomerDetailsProviderProps> = ({
  children,
  id,
}) => {
  // 3. useCustomerDetailsQuery 훅에서 refetch 함수를 받아옵니다.
  const { data, loading, refetch } = useCustomerDetailsQuery({
    displayLoader: true,
    variables: {
      id,
    },
  });

  // 4. Provider의 value 객체에 refetch 함수를 포함시킵니다.
  const providerValues: CustomerDetailsConsumerProps = {
    customer: data,
    tiers: data?.membershipTiers || [],
    reps: mapEdgesToItems(data?.salesRepresentatives) || [],
    loading,
    refetch,
  };

  return (
    <CustomerDetailsContext.Provider value={providerValues}>
      {children}
    </CustomerDetailsContext.Provider>
  );
};
