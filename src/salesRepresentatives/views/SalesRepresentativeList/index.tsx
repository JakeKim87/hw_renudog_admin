import { useSalesRepresentativesQuery } from "@dashboard/graphql";
import useListSettings from "@dashboard/hooks/useListSettings";
import useNavigator from "@dashboard/hooks/useNavigator";
import SalesRepresentativeListPage from "@dashboard/salesRepresentatives/components/SalesRepresentativeListPage";
import { ListViews } from "@dashboard/types";
import { mapEdgesToItems } from "@dashboard/utils/maps";
import React from "react";

import {
  salesRepresentativeAddUrl,
  SalesRepresentativeListUrlQueryParams,
  salesRepresentativeUrl,
} from "../../urls";

interface SalesRepresentativeListProps {
  params: SalesRepresentativeListUrlQueryParams;
}

export const SalesRepresentativeList: React.FC<SalesRepresentativeListProps> = ({ params }) => {
  const navigate = useNavigator();
  const { updateListSettings, settings } = useListSettings(
    ListViews.SALES_REPRESENTATIVE_LIST, // 새로운 ListView enum 추가 필요
  );

  const { data, loading } = useSalesRepresentativesQuery({
    displayLoader: true,
  });

  const reps = mapEdgesToItems(data?.salesRepresentatives) || [];

  return (
    <SalesRepresentativeListPage
      reps={reps}
      settings={settings}
      disabled={loading}
      onUpdateListSettings={updateListSettings}
      onRowClick={id => navigate(salesRepresentativeUrl(id))}
      onAdd={() => navigate(salesRepresentativeAddUrl())}
    />
  );
};

export default SalesRepresentativeList;