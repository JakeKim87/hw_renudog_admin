// @ts-strict-ignore
import { FetchResult } from "@apollo/client";
import { ChannelVoucherData } from "@dashboard/channels/utils";
import { VoucherDetailsPageFormData } from "@dashboard/discounts/components/VoucherDetailsPage";
import { getChannelsVariables } from "@dashboard/discounts/handlers";
import { DiscountTypeEnum, RequirementsPicker } from "@dashboard/discounts/types";
import {
  DiscountValueTypeEnum,
  VoucherChannelListingUpdateMutation,
  VoucherChannelListingUpdateMutationVariables,
  VoucherDetailsFragment,
  VoucherRewardTypeEnum,
  VoucherTypeEnum,
  VoucherUpdateMutation,
  VoucherUpdateMutationVariables,
} from "@dashboard/graphql";
import { joinDateTime } from "@dashboard/misc";
import { arrayDiff } from "@dashboard/utils/arrays";

export function createUpdateHandler(
  voucher: VoucherDetailsFragment,
  voucherChannelsChoices: ChannelVoucherData[],
  updateVoucher: (
    variables: VoucherUpdateMutationVariables,
  ) => Promise<FetchResult<VoucherUpdateMutation>>,
  updateChannels: (options: {
    variables: VoucherChannelListingUpdateMutationVariables;
  }) => Promise<FetchResult<VoucherChannelListingUpdateMutation>>,
) {
  return async (formData: VoucherDetailsPageFormData) => {
    const { id } = voucher;

    let channelUpdateVariables: VoucherChannelListingUpdateMutationVariables;

    if (formData.rewardType === VoucherRewardTypeEnum.POINTS) {
      const initialChannelIds = voucherChannelsChoices.map(c => c.id);
      const currentChannelIds = formData.channelListings.map(c => c.id);
      const { added, removed } = arrayDiff(initialChannelIds, currentChannelIds);

      channelUpdateVariables = {
        id,
        input: {
          addChannels: added.map(channelId => ({
            channelId,
            discountValue: 0,
            minAmountSpent: null,
          })),
          removeChannels: removed,
        },
      };
    } else {
      // '할인' 타입일 경우, 기존 핸들러를 그대로 사용합니다.
      channelUpdateVariables = getChannelsVariables(id, formData, voucherChannelsChoices);
    }
    
    const errors = await Promise.all([
      updateVoucher({
        id,
        input: {
          name: formData.name,
          applyOncePerCustomer: true, //formData.applyOncePerCustomer,
          applyOncePerOrder: formData.applyOncePerOrder,
          onlyForStaff: false, //formData.onlyForStaff,
          discountValueType:
            formData.rewardType === VoucherRewardTypeEnum.DISCOUNT
              ? formData.discountType === DiscountTypeEnum.VALUE_PERCENTAGE
                ? DiscountValueTypeEnum.PERCENTAGE
                : DiscountValueTypeEnum.FIXED
              : null, 
          endDate: formData.hasEndDate ? joinDateTime(formData.endDate, formData.endTime) : null,
          minCheckoutItemsQuantity:
            formData.requirementsPicker !== RequirementsPicker.ITEM
              ? 0
              : parseFloat(formData.minCheckoutItemsQuantity),
          startDate: joinDateTime(formData.startDate, formData.startTime),
          type:
            formData.discountType === DiscountTypeEnum.SHIPPING
              ? VoucherTypeEnum.SHIPPING
              : formData.type,
          usageLimit: null, //formData.hasUsageLimit ? formData.usageLimit : null,
          singleUse: true, //formData.singleUse,
          addCodes: formData.codes.map(({ code }) => code),
          rewardType: formData.rewardType,
          rewardPoints:
            formData.rewardType === VoucherRewardTypeEnum.POINTS
              ? formData.rewardPoints
                ? parseInt(formData.rewardPoints.toString(), 10)
                : null
              : null,
        },
      }).then(({ data }) => data?.voucherUpdate.errors ?? []),

      updateChannels({
        variables: channelUpdateVariables,
      }).then(({ data }) => data?.voucherChannelListingUpdate.errors ?? []),

    ]);

    return errors.flat();
  };
}
