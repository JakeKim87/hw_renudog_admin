import { Skeleton } from "@saleor/macaw-ui-next";
import React from "react";
import { Link } from "react-router-dom";

import { WelcomePageAnalyticsCard } from "../WelcomePageSidebar/components/WelcomePageAnalyticsCard";
import { useWelcomePageNewUsers } from "./useWelcomePageNewUsers";

interface WelcomePageNewUsersProps {
  hasPermissionToManageUsers: boolean;
}

const inactiveCustomersUrl = "/customers?isActive=false";

export const WelcomePageNewUsers = ({ hasPermissionToManageUsers }: WelcomePageNewUsersProps) => {
  const { newUsersCount, loading, hasError } = useWelcomePageNewUsers({
    hasPermissionToManageUsers,
  });

  return (
    <Link to={inactiveCustomersUrl} style={{ textDecoration: "none", color: "inherit" }}>
      <WelcomePageAnalyticsCard
        title="신규 가입건"
        testId="new-users-analytics"
        withSubtitle={false}
      >
        {hasError ? (
          0
        ) : !loading ? (
          newUsersCount
        ) : (
          <Skeleton style={{ minWidth: "4ch" }} />
        )}
      </WelcomePageAnalyticsCard>
    </Link>
  );
};