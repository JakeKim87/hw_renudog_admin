import { DashboardCard } from "@dashboard/components/Card";
import RequirePermissions from "@dashboard/components/RequirePermissions";
import { ChannelFragment, DeliveryStatus, OrderStatusFilter, PermissionEnum } from "@dashboard/graphql";
import { Box, Text } from "@saleor/macaw-ui-next";
import React from "react";

import { WelcomePageNewUsers } from "../WelcomePageNewUsers/WelcomePageNewUsers";
import { useWelcomePageOrderStats } from "../WelcomePageOrderStatusCard/useWelcomePageOrderStatusCount";
import { WelcomePageOrderStatusCard } from "../WelcomePageOrderStatusCard/WelcomePageOrderStatusCard";
import { WelcomePageSidebarContextProvider } from "./context/WelcomePageSidebarContextProvider";

interface HomeSidebarProps {
  channel: ChannelFragment | undefined;
  setChannel: (channelId: string) => void;
  channels: ChannelFragment[];
  hasPermissionToManageOrders: boolean;
  hasPermissionToManageUsers: boolean;
}

export const WelcomePageSidebar = (props: HomeSidebarProps) => {

  const { counts, loading, hasError } = useWelcomePageOrderStats({
    hasPermissionToManageOrders: props.hasPermissionToManageOrders,
  });

  return (
    <WelcomePageSidebarContextProvider {...props}>
      <DashboardCard borderRadius={3} borderWidth={1} borderStyle="solid" borderColor="default1">
        <DashboardCard.Header gap={3} display="flex" flexWrap="wrap">
          <DashboardCard.Title>
            <Text size={8}>
              스토어 정보
            </Text>
          </DashboardCard.Title>

          {/* <AppChannelSelect
            channels={props.channels}
            selectedChannelId={props.channel?.id ?? ""}
            onChannelSelect={props.setChannel}
          /> */}
        </DashboardCard.Header>
        <DashboardCard.Content>
          <Box display="grid" gap={5} marginBottom={7}>
            <RequirePermissions requiredPermissions={[PermissionEnum.MANAGE_USERS]}>
              <WelcomePageNewUsers hasPermissionToManageUsers={props.hasPermissionToManageUsers} />
            </RequirePermissions>

            <RequirePermissions requiredPermissions={[PermissionEnum.MANAGE_ORDERS]}>
              <Box display="grid" __gridTemplateColumns="1fr 1fr" gap={4}>
                <WelcomePageOrderStatusCard
                  title="신규 주문"
                  status={OrderStatusFilter.UNFULFILLED}
                  count={counts.unfulfilled}
                  loading={loading}
                  hasError={hasError}
                />
                <WelcomePageOrderStatusCard
                  title="배송 준비중"
                  status={DeliveryStatus.PREPARING}
                  count={counts.preparing}
                  loading={loading}
                  hasError={hasError}
                />
                <WelcomePageOrderStatusCard
                  title="배송중"
                  status={DeliveryStatus.IN_TRANSIT}
                  count={counts.inTransit}
                  loading={loading}
                  hasError={hasError}
                />
                <WelcomePageOrderStatusCard
                  title="배송 완료"
                  status={DeliveryStatus.DELIVERED}
                  count={counts.delivered}
                  loading={loading}
                  hasError={hasError}
                />
              </Box>
            </RequirePermissions>
            {/* <RequirePermissions requiredPermissions={[PermissionEnum.MANAGE_ORDERS]}>
              <WelcomePageSalesAnalytics />
              <WelcomePageStocksAnalytics />
            </RequirePermissions> */}
          </Box>
          {/* <WelcomePageActivities /> */}
        </DashboardCard.Content>
      </DashboardCard>
    </WelcomePageSidebarContextProvider>
  );
};
