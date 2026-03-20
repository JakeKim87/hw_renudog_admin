import { useWelcomePageNewUsersQuery } from "@dashboard/graphql";

interface UseWelcomePageNewUsers {
  hasPermissionToManageUsers: boolean;
}

export const useWelcomePageNewUsers = ({
  hasPermissionToManageUsers,
}: UseWelcomePageNewUsers) => {
  const {
    data: newUsersData,
    loading: newUsersLoading,
    error: newUsersError,
  } = useWelcomePageNewUsersQuery({
    variables: {
      hasPermissionToManageUsers,
    },
    skip: !hasPermissionToManageUsers,
  });

  return {
    newUsersCount: newUsersData?.customers?.totalCount ?? 0,
    loading: newUsersLoading,
    hasError: !!newUsersError,
  };
};