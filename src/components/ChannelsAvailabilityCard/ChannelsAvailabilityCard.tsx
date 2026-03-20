// @ts-strict-ignore
import { Channel as ChannelList, ChannelData } from "@dashboard/channels/utils";
import { PermissionEnum } from "@dashboard/graphql";
import { RequireOnlyOne } from "@dashboard/misc";
import { Box } from "@saleor/macaw-ui-next";
import React from "react";
import { useIntl } from "react-intl";

import { DashboardCard } from "../Card";
import { ChannelAvailabilityItemContent } from "./Channel";
import {
  ChannelsAvailabilityWrapperProps,
} from "./ChannelsAvailabilityCardWrapper";
import { ChannelOpts, ChannelsAvailabilityError, Messages } from "./types";
import { getChannelsAvailabilityMessages } from "./utils";

export interface ChannelsAvailability
  extends Omit<ChannelsAvailabilityWrapperProps, "children" | "selectedChannelsCount"> {
  channels: ChannelData[];
  /** Channels that have no settings */
  channelsList: ChannelList[];
  errors?: ChannelsAvailabilityError[];
  disabled?: boolean;
  messages?: Messages;
  managePermissions: PermissionEnum[];
  onChange?: (id: string, data: ChannelOpts) => void;
}

export type ChannelsAvailabilityCardProps = RequireOnlyOne<
  ChannelsAvailability,
  "channels" | "channelsList"
>;

const ChannelsAvailability: React.FC<ChannelsAvailabilityCardProps> = props => {
  const {
    errors = [],
    channels,
    channelsList,
    messages,
    onChange,
  } = props;
  const intl = useIntl();

  // channels가 있으면 쓰고, 없으면 channelsList를 쓰고, 둘 다 없으면 빈 배열
  const items = channels || channelsList || [];

  return (
    <DashboardCard>
      <DashboardCard.Header>
        <DashboardCard.Title>
          노출 여부
        </DashboardCard.Title>
      </DashboardCard.Header>
      
      <DashboardCard.Content>
        {items.map((channel) => {
          const channelErrors = errors?.filter(error => error.channels?.includes(channel.id)) || [];
          
          // 데이터가 불완전할 경우를 대비해 메시지 생성 시 방어 코드 적용
          let channelsMessages: any = {};
          try {
             channelsMessages = getChannelsAvailabilityMessages({
              messages,
              channels: [channel as ChannelData], 
              intl,
              localizeDate: () => "", 
            });
          } catch(e) { /* ignore */ }

          return (
            <Box key={channel.id}>
              <Box display="flex" flexDirection="column" gap={2}>
                <ChannelAvailabilityItemContent
                  data={channel as ChannelData} 
                  errors={channelErrors}
                  messages={channelsMessages[channel.id]}
                  // 🚨 핵심 수정: onChange가 없으면 빈 함수를 전달하여 에러 방지
                  onChange={onChange || (() => undefined)}
                />
              </Box>
            </Box>
          );
        })}
      </DashboardCard.Content>
    </DashboardCard>
  );
};

export default ChannelsAvailability;