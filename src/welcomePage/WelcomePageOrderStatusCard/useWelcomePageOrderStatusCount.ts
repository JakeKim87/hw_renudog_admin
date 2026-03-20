// @ts-strict-ignore
import useAppChannel from "@dashboard/components/AppLayout/AppChannelContext";
import { useWelcomePageOrderStatusCountsQuery } from "@dashboard/graphql";

interface UseWelcomePageOrderStatsOpts {
  hasPermissionToManageOrders: boolean;
}

export const useWelcomePageOrderStats = ({ hasPermissionToManageOrders }: UseWelcomePageOrderStatsOpts) => {
  const { channel } = useAppChannel(false);

  const { data, loading, error } = useWelcomePageOrderStatusCountsQuery({
    skip: !hasPermissionToManageOrders || !channel,
    variables: {
      channel: channel?.slug,
      hasPermissionToManageOrders,
    },
  });

  return {
    counts: {
      unfulfilled: data?.unfulfilledOrders?.totalCount,
      preparing: data?.preparingOrders?.totalCount,
      inTransit: data?.inTransitOrders?.totalCount,
      delivered: data?.deliveredOrders?.totalCount,
    },
    loading,
    hasError: !!error,
  };
};