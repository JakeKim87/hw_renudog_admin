// @ts-strict-ignore
import { DashboardCard } from "@dashboard/components/Card";
import CardSpacer from "@dashboard/components/CardSpacer";
import RichTextEditor from "@dashboard/components/RichTextEditor";
import { RichTextEditorLoading } from "@dashboard/components/RichTextEditor/RichTextEditorLoading";
import { ProductErrorFragment } from "@dashboard/graphql";
import { commonMessages } from "@dashboard/intl";
import { getFormErrors, getProductErrorMessage } from "@dashboard/utils/errors";
import { useRichTextContext } from "@dashboard/utils/richText/context";
import { OutputData } from "@editorjs/editorjs";
import { Box, Checkbox, Input, Text } from "@saleor/macaw-ui-next";
import React from "react";
import { useIntl } from "react-intl";

interface ProductDetailsFormProps {
  data: {
    description: OutputData;
    name: string;
    rating: number;
    rewardPointRate: number;
    useChannelDefaultRate: boolean;
  };
  disabled?: boolean;
  errors: ProductErrorFragment[];

  onChange: (event: any) => any;
}

export const ProductDetailsForm: React.FC<ProductDetailsFormProps> = ({
  data,
  onChange,
  errors,
  disabled,
}) => {
  const intl = useIntl();
  const formErrors = getFormErrors(["name", "description", "rating", "rewardPointRate"], errors);
  const { editorRef, defaultValue, isReadyForMount, handleChange } = useRichTextContext();

  return (
    <>
      <DashboardCard>
        <DashboardCard.Header>
          <DashboardCard.Title>
            {intl.formatMessage(commonMessages.generalInformations)}
          </DashboardCard.Title>
        </DashboardCard.Header>
        <DashboardCard.Content display="grid" gap={2}>
          <Input
            label={intl.formatMessage({
              id: "6AMFki",
              defaultMessage: "Name",
              description: "product name",
            })}
            size="small"
            value={data.name || ""}
            onChange={onChange}
            error={!!formErrors.name}
            name="name"
            disabled={disabled}
            helperText={getProductErrorMessage(formErrors.name, intl)}
          />

          {isReadyForMount ? (
            <RichTextEditor
              editorRef={editorRef}
              defaultValue={defaultValue}
              onChange={handleChange}
              disabled={disabled}
              error={!!formErrors.description}
              helperText={getProductErrorMessage(formErrors.description, intl)}
              label={intl.formatMessage(commonMessages.description)}
              name="description"
            />
          ) : (
            <RichTextEditorLoading
              label={intl.formatMessage(commonMessages.description)}
              name="description"
            />
          )}
          {/* <Box __width="25%">
            <Input
              label={intl.formatMessage({
                id: "L7N+0y",
                defaultMessage: "Product Rating",
                description: "product rating",
              })}
              size="small"
              value={data.rating || ""}
              onChange={onChange}
              error={!!formErrors.rating}
              name="rating"
              type="number"
              disabled={disabled}
              helperText={getProductErrorMessage(formErrors.rating, intl)}
            />
          </Box> */}
        </DashboardCard.Content>
      </DashboardCard>
      <CardSpacer />
      {/* <DashboardCard>
        <DashboardCard.Header>
          <DashboardCard.Title>
            적립금 설정
          </DashboardCard.Title>
        </DashboardCard.Header>
        <DashboardCard.Content>
          <Box display="flex" alignItems="start" gap={4}>
            <Checkbox
              name="useChannelDefaultRate"
              checked={Boolean(data.useChannelDefaultRate)}
              onCheckedChange={value => {
                // 3. onCheckedChange 이벤트에 맞춰 핸들러를 호출합니다.
                onChange({
                  target: {
                    name: "useChannelDefaultRate",
                    value: value,
                  },
                });
              }}
              disabled={disabled}
              data-test-id="use-channel-default-rate-checkbox"
            />
            <Box display="flex" flexDirection="column">
              <Text>채널 기본 적립률 사용</Text>
              <Text size={2} color="default2" marginTop={1}>
                이 옵션을 선택하면, 상품이 판매되는 채널에 설정된 기본 적립률을 따릅니다.
              </Text>
            </Box>
          </Box>
          
          {!data.useChannelDefaultRate && (
            <Box marginTop={4}>
              <Input
                name="rewardPointRate"
                label="개별 적립률"
                type="number"
                disabled={disabled}
                value={data.rewardPointRate}
                onChange={onChange}
                error={!!formErrors.rewardPointRate}
                helperText={getProductErrorMessage(formErrors.rewardPointRate, intl)}
                min={0}
                max={100}
                endAdornment={<Text>%</Text>}
                __width="50%"
              />
            </Box>
          )}
        </DashboardCard.Content>
      </DashboardCard> */}
    </>
  );
};
