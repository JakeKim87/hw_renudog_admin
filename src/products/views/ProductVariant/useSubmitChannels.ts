// @ts-strict-ignore
import {
  ProductVariantFragment,
  useProductChannelListingUpdateMutation,
  useProductVariantChannelListingUpdateMutation,
} from "@dashboard/graphql";
import { extractMutationErrors } from "@dashboard/misc";
import { ProductVariantUpdateSubmitData } from "@dashboard/products/components/ProductVariantPage/form";

type Product = ProductVariantUpdateSubmitData;
type Variant = ProductVariantFragment;

const isFormDataChanged = (data: Product, variant: Variant) =>
  data.channelListings.some(channel => {
    const variantChannel = variant.channelListings.find(
      variantChannel => variantChannel.channel.id === channel.id,
    );
    
    // 기존 가격, 원가 비교
    const priceHasChanged = channel.value.price !== variantChannel?.price?.amount.toString();
    const costPriceHasChanged =
      channel.value.costPrice !== variantChannel?.costPrice?.amount.toString();
    const discountedPriceHasChanged = channel.value.discountedPrice !== variantChannel?.discountedPrice?.amount?.toString();

    const preorderThresholdHasChanged =
      channel.value?.preorderThreshold !== variantChannel?.preorderThreshold?.quantity;

    // [추가] Tiers 변경 여부 확인 (간단한 길이 비교 예시, 실제로는 깊은 비교가 더 정확함)
    // 폼에 있는 tiers 개수와 서버에서 온 tiers 개수가 다르면 변경된 것으로 간주
    const currentTiersCount = channel.value.tiers?.length || 0;
    const originalTiersCount = variantChannel?.tiers?.length || 0; // 백엔드 타입에 tiers 추가되었다고 가정
    const tiersHasChanged = currentTiersCount !== originalTiersCount;
    // (더 정밀하게 하려면 JSON.stringify 비교 등을 사용할 수 있습니다)

    return priceHasChanged || costPriceHasChanged || discountedPriceHasChanged || preorderThresholdHasChanged || tiersHasChanged;
  });
const hasRecordDeleted = (data: Product, variant: Variant) =>
  data.channelListings.length !== variant.channelListings.length;
const createProductUpdateListingInput = (data: Product, variant: Variant) => {
  const ids = data.channelListings.map(c => c.data.id);

  return variant.channelListings
    .map(c => c.channel.id)
    .filter(cId => !ids.includes(cId))
    .map(channelId => ({ channelId, removeVariants: [variant.id] }));
};
const createVariantUpdateListingInput = (data: Product) =>
  data.channelListings.map(listing => ({
    channelId: listing.id,
    costPrice: listing.value.costPrice || null,
    price: listing.value.price,
    discountedPrice: listing.value.discountedPrice || null,
    preorderThreshold: listing.value.preorderThreshold,
    tiers: listing.value.tiers?.map(tier => ({
      minQuantity: parseInt(tier.minQuantity.toString(), 10), // 혹은 tier.minQuantity 타입에 맞춰 조정
      price: tier.price
    })) || []
  }));

export const useSubmitChannels = () => {
  const [updateChannelListing] = useProductChannelListingUpdateMutation();
  const [updateChannels, updateChannelsOpts] = useProductVariantChannelListingUpdateMutation();
  const handleSubmitChannels = async (data: Product, variant: Variant) => {
    const channelsHaveChanged = isFormDataChanged(data, variant);
    const amountOfRecordsHasChanged = hasRecordDeleted(data, variant);

    if (amountOfRecordsHasChanged) {
      const updateChannels = createProductUpdateListingInput(data, variant);

      await updateChannelListing({
        variables: {
          id: variant.product.id,
          input: { updateChannels },
        },
      });
    }

    if (channelsHaveChanged) {
      return extractMutationErrors(
        updateChannels({
          variables: {
            id: variant.id,
            input: createVariantUpdateListingInput(data),
          },
        }),
      );
    }

    return [];
  };

  return { handleSubmitChannels, updateChannelsOpts };
};
