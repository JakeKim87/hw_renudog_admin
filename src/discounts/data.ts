import { ChannelVoucherData } from "@dashboard/channels/utils";
import { VoucherChannelListingAddInput, VoucherRewardTypeEnum } from "@dashboard/graphql";

import { VoucherDetailsPageFormData } from "./components/VoucherDetailsPage";
import { RequirementsPicker } from "./types";

const getChannelDiscountValue = (
  channel: ChannelVoucherData,
  formData: VoucherDetailsPageFormData,
) => {
  // 100 means that the discount is 100%
  return formData.discountType.toString() === "SHIPPING" ? 100 : channel.discountValue;
};

const getChannelMinAmountSpent = (
  channel: ChannelVoucherData,
  formData: VoucherDetailsPageFormData,
) => {
  if (formData.requirementsPicker === RequirementsPicker.NONE) {
    return null;
  }

  if (formData.requirementsPicker === RequirementsPicker.ITEM) {
    return 0;
  }

  return channel.minSpent;
};

const mapChannelToChannelInput =
  (formData: VoucherDetailsPageFormData) => (channel: ChannelVoucherData): VoucherChannelListingAddInput => {
    if (formData.rewardType === VoucherRewardTypeEnum.POINTS) {
      return {
        channelId: channel.id,
        discountValue: 0,
        minAmountSpent: null,
      };
    }

    return {
      channelId: channel.id,
      discountValue: getChannelDiscountValue(channel, formData),
      minAmountSpent: getChannelMinAmountSpent(channel, formData),
    };
};

const filterNotDiscountedChannel = (channelInput: VoucherChannelListingAddInput) =>
  // discountValue가 0인 경우도 유효한 값으로 취급하여 필터링되지 않도록 수정합니다.
  channelInput.discountValue !== null && channelInput.discountValue !== undefined && channelInput.discountValue !== "";

export const getAddedChannelsInputFromFormData = (formData: VoucherDetailsPageFormData) =>
  formData.channelListings
    ?.map(mapChannelToChannelInput(formData))
    .filter(filterNotDiscountedChannel) || [];