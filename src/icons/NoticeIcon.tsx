import { SvgIcon, SvgIconProps } from "@material-ui/core";
import React from "react";

// Google Material Icons의 'Campaign' (확성기 모양) 아이콘
export const NoticeIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
      fill="currentColor"
    />
  </SvgIcon>
);

export default NoticeIcon;