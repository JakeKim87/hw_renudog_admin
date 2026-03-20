import { useUser } from "@dashboard/auth";
import useAppChannel from "@dashboard/components/AppLayout/AppChannelContext";
import RequirePermissions, { hasPermissions } from "@dashboard/components/RequirePermissions";
import { SalesAnalytics } from "@dashboard/components/SalesAnalytics/SalesAnalytics";
import { PermissionEnum } from "@dashboard/graphql";
import { Box } from "@saleor/macaw-ui-next";
import React from "react";

import { WelcomePageSidebar } from "./WelcomePageSidebar";

export const WelcomePage = () => {
  const { channel, setChannel } = useAppChannel(false);
  const { user } = useUser();
  const channels = user?.accessibleChannels ?? [];
  const userPermissions = user?.userPermissions || [];
  const hasPermissionToManageOrders = hasPermissions(userPermissions, [
    PermissionEnum.MANAGE_ORDERS,
  ]);
  const hasPermissionToManageUsers = hasPermissions(userPermissions, [
    PermissionEnum.MANAGE_USERS,
  ]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={7}
      paddingX={8}
      paddingY={6}
      paddingTop={9}
    >
      <WelcomePageSidebar
        channel={channel}
        setChannel={setChannel}
        channels={channels}
        hasPermissionToManageOrders={hasPermissionToManageOrders}
        hasPermissionToManageUsers={hasPermissionToManageUsers}
      />
      
      <RequirePermissions requiredPermissions={[PermissionEnum.MANAGE_ORDERS]}>
        <SalesAnalytics channelSlug={channel?.slug} />
      </RequirePermissions>
    </Box>
  );
};
