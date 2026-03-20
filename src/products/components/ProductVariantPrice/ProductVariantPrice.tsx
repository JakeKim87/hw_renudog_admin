// @ts-strict-ignore
import {
  ChannelData,
  ChannelPriceAndPreorderArgs,
  ChannelPriceArgs,
} from "@dashboard/channels/utils";
import { DashboardCard } from "@dashboard/components/Card";
import PriceField from "@dashboard/components/PriceField";
import ResponsiveTable from "@dashboard/components/ResponsiveTable";
import TableRowLink from "@dashboard/components/TableRowLink";
import {
  ProductChannelListingErrorFragment,
  ProductErrorFragment,
} from "@dashboard/graphql";
import { renderCollection } from "@dashboard/misc";
import {
  getFormChannelError,
  getFormChannelErrors,
  getFormErrors,
} from "@dashboard/utils/errors";
import { TableBody, TableCell, TableHead, TextField } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import { IconButton } from "@saleor/macaw-ui";
import {
  Box,
  Button,
  Skeleton,
  Text,
  vars
} from "@saleor/macaw-ui-next";
import React from "react";
import { FormattedMessage, MessageDescriptor, useIntl } from "react-intl";

interface Tier {
  minQuantity: string | number;
  price: string | number;
}

interface ProductVariantPriceProps {
  productVariantChannelListings?: ChannelData[];
  errors: Array<ProductErrorFragment | ProductChannelListingErrorFragment>;
  loading?: boolean;
  disabled?: boolean;
  onChange?: (
    id: string,
    data: ChannelPriceArgs | ChannelPriceAndPreorderArgs
  ) => void;
  disabledMessage?: MessageDescriptor;
}

const numberOfColumns = 5;

// [수정] 가운데 정렬 및 수직 중앙 정렬 스타일 적용
const COMMON_CELL_STYLES = { 
  verticalAlign: "middle", 
  textAlign: "center" as const 
};

const sanitizeNumericInput = (value: string | number) => {
  if (!value && value !== 0) return "";
  return String(value).replace(/\D/g, "");
};

const VariantTieredPricing: React.FC<{
  tiers: Tier[];
  currencySymbol: string;
  loading?: boolean;
  onChange: (newTiers: Tier[]) => void;
}> = ({ tiers, currencySymbol, loading, onChange }) => {
  const handleAddTier = () => {
    onChange([...tiers, { minQuantity: "", price: "" }]);
  };

  const handleRemoveTier = (index: number) => {
    const newTiers = [...tiers];
    newTiers.splice(index, 1);
    onChange(newTiers);
  };

  const handleFieldChange = (index: number, field: keyof Tier, value: string) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: sanitizeNumericInput(value) };
    onChange(newTiers);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {tiers.map((tier, index) => (
        <Box key={index} display="flex" gap={2} alignItems="flex-start">
          <TextField
            label="최소 수량"
            value={tier.minQuantity}
            onChange={(e) => handleFieldChange(index, "minQuantity", e.target.value)}
            disabled={loading}
            variant="outlined"
            style={{ width: "80px" }}
          />
          <PriceField
            label="단가"
            name={`tier-price-${index}`}
            value={String(tier.price)}
            currencySymbol={currencySymbol}
            onChange={(e) => handleFieldChange(index, "price", e.target.value)}
            disabled={loading}
            style={{ width: "120px" }}
          />
          <IconButton
            variant="secondary"
            onClick={() => handleRemoveTier(index)}
            disabled={loading}
            style={{ marginTop: "4px" }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      <Button variant="secondary" size="small" onClick={handleAddTier} disabled={loading} type="button" style={{ alignSelf: "flex-start" }}>
        <FormattedMessage id="AddTierButton" defaultMessage="+ 구간 추가" />
      </Button>
    </Box>
  );
};

export const ProductVariantPrice: React.FC<ProductVariantPriceProps> = (props) => {
  const {
    disabled = false,
    errors = [],
    productVariantChannelListings = [],
    loading,
    onChange,
    disabledMessage,
  } = props;
  const intl = useIntl();

  const channelApiErrors = errors.filter((e) => "channels" in e) as ProductChannelListingErrorFragment[];
  
  const apiErrors = getFormChannelErrors(["price", "costPrice", "discountedPrice"], channelApiErrors);

  if (disabled || !productVariantChannelListings.length) {
    return (
      <DashboardCard>
        <DashboardCard.Header>
          <DashboardCard.Title>
            {intl.formatMessage({ id: "Xm9qOu", defaultMessage: "Pricing" })}
          </DashboardCard.Title>
        </DashboardCard.Header>
        <DashboardCard.Content>
          <Text size={2}>
            {intl.formatMessage(disabledMessage || { id: "e48Igh", defaultMessage: "Assign this variant to a channel..." })}
          </Text>
        </DashboardCard.Content>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <DashboardCard.Header>
        <DashboardCard.Title>
          {intl.formatMessage({ id: "Xm9qOu", defaultMessage: "Pricing" })}
        </DashboardCard.Title>
      </DashboardCard.Header>
      <ResponsiveTable>
        <TableHead>
          <TableRowLink>
            <TableCell style={{ paddingLeft: vars.spacing[6], verticalAlign: "middle" }}>
              <Text size={2} color="default2"><FormattedMessage id="c8UT0c" defaultMessage="Channel Name" /></Text>
            </TableCell>
            <TableCell style={{ width: 180, verticalAlign: "middle", textAlign: "center" }}>
              <Text size={2} color="default2"><FormattedMessage id="xXsB0E" defaultMessage="원가" /></Text>
            </TableCell>
            <TableCell style={{ width: 180, verticalAlign: "middle", textAlign: "center" }}>
              <Text size={2} color="default2"><FormattedMessage id="BzaBQV" defaultMessage="정상가" /></Text>
            </TableCell>
            <TableCell style={{ width: 180, verticalAlign: "middle", textAlign: "center" }}>
              <Text size={2} color="default2"><FormattedMessage id="DiscountedPriceHeader" defaultMessage="판매가" /></Text>
            </TableCell>
            <TableCell style={{ width: 300, verticalAlign: "middle" }}>
              <Text size={2} color="default2"><FormattedMessage id="TieredPricingHeader" defaultMessage="수량별 할인 설정" /></Text>
            </TableCell>
          </TableRowLink>
        </TableHead>
        <TableBody>
          {renderCollection(
            productVariantChannelListings,
            (listing, index) => {
              const fieldName = `${listing.id}-channelListing-price`;
              const formErrors = getFormErrors([fieldName], errors);
              const priceApiError = getFormChannelError(apiErrors.price, listing.id) || formErrors[fieldName];
              const costPriceError = getFormChannelError(apiErrors.costPrice, listing.id);
              const discountedPriceError = getFormChannelError((apiErrors as any).discountedPrice, listing.id);

              const currentPrice = listing.price ?? "";
              const currentCost = listing.costPrice ?? "";
              const currentDiscounted = (listing as any).discountedPrice ?? "";
              const currentTiers = listing.tiers || [];

              return (
                <TableRowLink key={listing?.id || `skeleton-${index}`}>
                  <TableCell style={{ paddingLeft: vars.spacing[6], verticalAlign: "middle" }}>
                    <Text>{listing?.name || <Skeleton />}</Text>
                  </TableCell>

                  {/* 3. 원가 */}
                  <TableCell style={COMMON_CELL_STYLES}>
                    {listing ? (
                      <PriceField
                        error={!!costPriceError}
                        name={`${listing.id}-costPrice`}
                        value={currentCost}
                        currencySymbol="원"
                        onChange={(e) => onChange(listing.id, {
                          price: currentPrice,
                          costPrice: sanitizeNumericInput(e.target.value),
                          discountedPrice: currentDiscounted,
                          tiers: currentTiers
                        } as any)}
                        disabled={loading}
                      />
                    ) : <Skeleton />}
                  </TableCell>

                  {/* 1. 판매가 */}
                  <TableCell style={COMMON_CELL_STYLES}>
                    {listing ? (
                      <PriceField
                        error={!!priceApiError}
                        name={fieldName}
                        value={currentPrice}
                        currencySymbol="원"
                        onChange={(e) => onChange(listing.id, {
                          price: sanitizeNumericInput(e.target.value),
                          costPrice: currentCost,
                          discountedPrice: currentDiscounted,
                          tiers: currentTiers
                        } as any)}
                        disabled={loading}
                      />
                    ) : <Skeleton />}
                  </TableCell>

                  {/* 2. 할인가 */}
                  <TableCell style={COMMON_CELL_STYLES}>
                    {listing ? (
                      <PriceField
                        error={!!discountedPriceError}
                        name={`${listing.id}-discountedPrice`}
                        value={currentDiscounted}
                        currencySymbol="원"
                        onChange={(e) => onChange(listing.id, {
                          price: currentPrice,
                          costPrice: currentCost,
                          discountedPrice: sanitizeNumericInput(e.target.value),
                          tiers: currentTiers
                        } as any)}
                        disabled={loading}
                      />
                    ) : <Skeleton />}
                  </TableCell>

                  {/* 4. 티어 */}
                  <TableCell style={{ ...COMMON_CELL_STYLES, paddingTop: 16, textAlign: "left" }}>
                    {listing ? (
                      <VariantTieredPricing
                        tiers={currentTiers}
                        currencySymbol="원"
                        loading={loading}
                        onChange={(newTiers) => onChange(listing.id, {
                          price: currentPrice,
                          costPrice: currentCost,
                          discountedPrice: currentDiscounted,
                          tiers: newTiers
                        } as any)}
                      />
                    ) : <Skeleton />}
                  </TableCell>
                </TableRowLink>
              );
            },
            () => (
              <TableRowLink>
                <TableCell colSpan={numberOfColumns}><Text><FormattedMessage id="/glQgs" defaultMessage="No channels found" /></Text></TableCell>
              </TableRowLink>
            )
          )}
        </TableBody>
      </ResponsiveTable>
    </DashboardCard>
  );
};