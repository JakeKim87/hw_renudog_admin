import icon from "@assets/favicons/icon.png";
import { Avatar, Box, Text } from "@saleor/macaw-ui-next";
import React from "react";

export const MountingPoint = () => {
  return (
    <Box display="flex" gap={3} paddingX={4} paddingY={5} alignItems="center">
      <Avatar.Store src={icon} size="small" backgroundColor={"transparent"} />
      <Text size={3} fontWeight="bold">
        리뉴독 Admin
      </Text>
    </Box>
  );
};
