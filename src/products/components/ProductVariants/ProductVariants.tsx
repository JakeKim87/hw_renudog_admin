// @ts-strict-ignore
import { ChannelData } from "@dashboard/channels/utils";
import { DashboardCard } from "@dashboard/components/Card";
import ResponsiveTable from "@dashboard/components/ResponsiveTable";
import TableRowLink from "@dashboard/components/TableRowLink";
import { ProductDetailsVariantFragment, RefreshLimitsQuery } from "@dashboard/graphql";
import { TableBody, TableCell, TableHead } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit"; // 아이콘 import
import { IconButton } from "@saleor/macaw-ui"; // 버튼 import
import { Box, Text } from "@saleor/macaw-ui-next";
import React from "react";

interface ProductVariantsProps {
  channels: ChannelData[];
  errors: any[];
  limits?: RefreshLimitsQuery["shop"]["limits"];
  variantAttributes?: any;
  variants: ProductDetailsVariantFragment[];
  productName: string;
  productId: string;
  onAttributeValuesSearch?: any;
  onChange?: any;
  onRowClick: (id: string) => void;
}

export const ProductVariants: React.FC<ProductVariantsProps> = ({
  channels = [], // [수정] 기본값 빈 배열 할당
  variants = [], // [수정] 기본값 빈 배열 할당
  onRowClick,
}) => {
  // 안전장치: 혹시라도 null이 들어올 경우를 대비해 한 번 더 체크
  const safeChannels = channels || [];
  const safeVariants = variants || [];

  return (
    <DashboardCard>
      <DashboardCard.Header>
        <DashboardCard.Title>Variants</DashboardCard.Title>
      </DashboardCard.Header>

      <ResponsiveTable>
        <TableHead>
          <TableRowLink>
            <TableCell style={{ width: "20%" }}>
              <Text size={2} color="default2" fontWeight="bold">
                Variant Name
              </Text>
            </TableCell>
            <TableCell style={{ width: "15%" }}>
              <Text size={2} color="default2" fontWeight="bold">
                SKU
              </Text>
            </TableCell>

            {/* safeChannels 사용 */}
            {safeChannels.map(channel => (
              <React.Fragment key={channel.id}>
                <TableCell style={{ textAlign: "right" }}>
                  <Box display="flex" flexDirection="column" alignItems="flex-end">
                    <Text size={2} color="default2" fontWeight="bold">
                      {channel.name}
                    </Text>
                    <Text size={1} color="default2">
                      (Price)
                    </Text>
                  </Box>
                </TableCell>
                <TableCell style={{ textAlign: "right" }}>
                  <Box display="flex" flexDirection="column" alignItems="flex-end">
                    <Text size={2} color="default2" fontWeight="bold">
                      {channel.name}
                    </Text>
                    <Text size={1} color="default2">
                      (할인가)
                    </Text>
                  </Box>
                </TableCell>
              </React.Fragment>
            ))}

            <TableCell style={{ width: "50px" }} />
          </TableRowLink>
        </TableHead>

        <TableBody>
          {/* safeVariants 사용 */}
          {safeVariants.map(variant => (
            <TableRowLink key={variant.id} onClick={() => onRowClick(variant.id)} hover>
              <TableCell>
                <Text>{variant.name || "-"}</Text>
              </TableCell>
              <TableCell>
                <Text>{variant.sku || "-"}</Text>
              </TableCell>

              {/* safeChannels 사용 */}
              {safeChannels.map(channel => {
                const listing = variant.channelListings?.find(l => l.channel.id === channel.id);
                const price = listing?.price?.amount;
                const currency = listing?.price?.currency;
                const discountedPrice = (listing as any)?.discountedPrice?.amount;

                return (
                  <React.Fragment key={channel.id}>
                    <TableCell style={{ textAlign: "right" }}>
                      {price ? (
                        <Text>
                          {currency} {price.toLocaleString()}
                        </Text>
                      ) : (
                        <Text color="default2">-</Text>
                      )}
                    </TableCell>
                    <TableCell style={{ textAlign: "right" }}>
                      {discountedPrice ? (
                        <Text fontWeight="bold" color="default1">
                          {currency} {discountedPrice.toLocaleString()}
                        </Text>
                      ) : (
                        <Text color="default2">-</Text>
                      )}
                    </TableCell>
                  </React.Fragment>
                );
              })}

              <TableCell>
                <IconButton
                  variant="secondary"
                  onClick={e => {
                    e.stopPropagation();
                    onRowClick(variant.id);
                  }}
                >
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRowLink>
          ))}

          {/* 데이터가 없을 때 표시 */}
          {safeVariants.length === 0 && (
            <TableRowLink>
              <TableCell colSpan={3 + safeChannels.length * 2}>
                <Box padding={3} display="flex" justifyContent="center">
                  <Text color="default2">No variants found</Text>
                </Box>
              </TableCell>
            </TableRowLink>
          )}
        </TableBody>
      </ResponsiveTable>
    </DashboardCard>
  );
};

export default ProductVariants;
