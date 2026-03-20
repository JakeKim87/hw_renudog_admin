// src/membershipTiers/views/MembershipTierList/index.tsx

import { useMembershipTiersQuery } from "@dashboard/graphql";
import useListSettings from "@dashboard/hooks/useListSettings";
import useNavigator from "@dashboard/hooks/useNavigator";
import MembershipTierListPage from "@dashboard/membershipTiers/components/MembershipTierListPage";
import { ListViews } from "@dashboard/types";
import React from "react";

// UI 컴포넌트를 import 합니다.
import {
  membershipTierAddUrl,
  MembershipTierListUrlQueryParams,
  membershipTierUrl,
} from "../../urls";

interface MembershipTierListProps {
  params: MembershipTierListUrlQueryParams;
}

export const MembershipTierList: React.FC<MembershipTierListProps> = ({ params }) => {
  const navigate = useNavigator();
  // useListSettings는 이제 컬럼 관리 용도로만 사용됩니다.
  const { updateListSettings, settings } = useListSettings(
    ListViews.MEMBERSHIP_TIER_LIST,
  );

  // 인자 없이 단순하게 데이터를 조회합니다.
  const { data, loading } = useMembershipTiersQuery({
    displayLoader: true,
  });

  // mapEdgesToItems가 필요 없습니다. 데이터는 이미 배열 형태입니다.
  const tiers = data?.membershipTiers || [];

  return (
    <MembershipTierListPage
      tiers={tiers}
      settings={settings}
      disabled={loading}
      onUpdateListSettings={updateListSettings}
      onRowClick={id => navigate(membershipTierUrl(id))}
      onAdd={() => navigate(membershipTierAddUrl())}
    />
  );
};

export default MembershipTierList;