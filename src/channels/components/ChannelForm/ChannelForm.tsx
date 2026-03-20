import { AutomaticallyCompleteCheckouts } from "@dashboard/channels/components/ChannelForm/AutomaticallyCompleteCheckouts";
import {
  ChannelShippingZones,
  ChannelWarehouses,
} from "@dashboard/channels/pages/ChannelDetailsPage/types";
import { DashboardCard } from "@dashboard/components/Card";
import { Combobox } from "@dashboard/components/Combobox";
import FormSpacer from "@dashboard/components/FormSpacer";
import {
  ChannelErrorFragment,
  CountryCode,
  MarkAsPaidStrategyEnum,
  StockSettingsInput,
  TransactionFlowStrategyEnum,
} from "@dashboard/graphql";
import useClipboard from "@dashboard/hooks/useClipboard";
import { ChangeEvent, FormChange } from "@dashboard/hooks/useForm";
import { commonMessages } from "@dashboard/intl";
import { getFormErrors } from "@dashboard/utils/errors";
import getChannelsErrorMessage from "@dashboard/utils/errors/channels";
import { Box, Button, CopyIcon, Divider, Input, Option, Text, Textarea } from "@saleor/macaw-ui-next";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { AllowUnpaidOrders } from "./AllowUnpaidOrders";
import { DefaultTransactionFlowStrategy } from "./DefaultTransactionFlowStrategy";
import { MarkAsPaid } from "./MarkAsPaid";
import { messages } from "./messages";

export interface FormData extends StockSettingsInput {
  name: string;
  currencyCode: string;
  slug: string;
  shippingZonesIdsToAdd: string[];
  shippingZonesIdsToRemove: string[];
  warehousesIdsToAdd: string[];
  warehousesIdsToRemove: string[];
  defaultRewardPointRate: number;
  shippingZonesToDisplay: ChannelShippingZones;
  warehousesToDisplay: ChannelWarehouses;
  defaultCountry: CountryCode;
  markAsPaidStrategy: MarkAsPaidStrategyEnum;
  deleteExpiredOrdersAfter: number;
  allowUnpaidOrders: boolean;
  defaultTransactionFlowStrategy: TransactionFlowStrategyEnum;
  automaticallyCompleteCheckouts: boolean;
  paymentInfo: string;
  deliveryInfo: string;
  exchangeInfo: string;
}

export interface ChannelFormProps {
  data: FormData;
  disabled: boolean;
  currencyCodes?: Option[];
  errors: ChannelErrorFragment[];
  selectedCurrencyCode?: string;
  selectedCountryDisplayName: string;
  countries: Option[];
  onChange: FormChange;
  onCurrencyCodeChange?: (event: ChangeEvent) => void;
  onDefaultCountryChange: (event: ChangeEvent) => void;
  onMarkAsPaidStrategyChange: () => void;
  onTransactionFlowStrategyChange: () => void;
  onAutomaticallyCompleteCheckoutsChange: () => void;
}

export const ChannelForm: React.FC<ChannelFormProps> = ({
  currencyCodes,
  data,
  disabled,
  errors,
  selectedCurrencyCode,
  selectedCountryDisplayName,
  countries,
  onChange,
  onCurrencyCodeChange,
  onDefaultCountryChange,
  onMarkAsPaidStrategyChange,
  onTransactionFlowStrategyChange,
  onAutomaticallyCompleteCheckoutsChange,
}) => {
  const intl = useIntl();
  const [, copy] = useClipboard();
  const formErrors = getFormErrors<keyof FormData, ChannelErrorFragment>(
    ["name", "slug", "currencyCode", "defaultCountry", "deleteExpiredOrdersAfter", "defaultRewardPointRate"],
    errors,
  );
  const renderCurrencySelection = currencyCodes && typeof onCurrencyCodeChange === "function";

  return (
    <>
      <DashboardCard>
        <DashboardCard.Header>
          <DashboardCard.Title>
            {intl.formatMessage(commonMessages.generalInformations)}
          </DashboardCard.Title>
        </DashboardCard.Header>
        <DashboardCard.Content data-test-id="general-information">
          <Input
            error={!!formErrors.name}
            helperText={getChannelsErrorMessage(formErrors?.name, intl)}
            disabled={disabled}
            label={intl.formatMessage(messages.channelName)}
            name="name"
            value={data.name}
            onChange={onChange}
            data-test-id="channel-name-input"
          />
          <FormSpacer />
          <Input
            data-test-id="slug-name-input"
            error={!!formErrors.slug}
            helperText={getChannelsErrorMessage(formErrors?.slug, intl)}
            disabled={disabled}
            label={intl.formatMessage(messages.channelSlug)}
            name="slug"
            value={data.slug}
            onChange={onChange}
            endAdornment={
              <Button
                variant="tertiary"
                onClick={() => copy(data.slug)}
                textTransform="uppercase"
                icon={<CopyIcon />}
              />
            }
          />
        </DashboardCard.Content>
      </DashboardCard>
      <Box display="grid" __gridTemplateColumns="2fr 1fr" rowGap={2}>
        <Text size={5} fontWeight="bold" margin={6}>
          <FormattedMessage {...messages.channelSettings} />
        </Text>
        <Text size={5} fontWeight="bold" margin={6}>
          <FormattedMessage {...messages.orderExpiration} />
        </Text>
        <Box paddingX={6}>
          {renderCurrencySelection ? (
            <Combobox
              data-test-id="channel-currency-select-input"
              allowCustomValues
              disabled={disabled}
              error={!!formErrors.currencyCode}
              label={intl.formatMessage(messages.channelCurrency)}
              helperText={getChannelsErrorMessage(formErrors?.currencyCode, intl)}
              options={currencyCodes}
              fetchOptions={() => undefined}
              name="currencyCode"
              value={{
                label: selectedCurrencyCode ?? "",
                value: selectedCurrencyCode ?? "",
              }}
              onChange={onCurrencyCodeChange}
            />
          ) : (
            <Box display="flex" flexDirection="column">
              <Text size={2}>
                <FormattedMessage {...messages.selectedCurrency} />
              </Text>
              <Text>{data.currencyCode}</Text>
            </Box>
          )}
        </Box>
        <Text size={2} paddingX={6}>
          <FormattedMessage {...messages.orderExpirationDescription} />
        </Text>
        <Box paddingX={6}>
          <Combobox
            data-test-id="country-select-input"
            disabled={disabled}
            error={!!formErrors.defaultCountry}
            label={intl.formatMessage(messages.defaultCountry)}
            helperText={getChannelsErrorMessage(formErrors?.defaultCountry, intl)}
            options={countries}
            fetchOptions={() => undefined}
            name="defaultCountry"
            value={{
              label: selectedCountryDisplayName,
              value: data.defaultCountry,
            }}
            onChange={onDefaultCountryChange}
          />
        </Box>
        <Box paddingX={6}>
          <Input
            name="deleteExpiredOrdersAfter"
            data-test-id="delete-expired-order-input"
            value={data.deleteExpiredOrdersAfter}
            error={!!formErrors.deleteExpiredOrdersAfter}
            type="number"
            label="TTL"
            onChange={onChange}
            min={0}
            max={120}
            // TODO: Should be removed after single autocomplete
            // select is migrated to macaw inputs
            __height={12.5}
          />
        </Box>
        {/* <MarkAsPaid
          isChecked={data.markAsPaidStrategy === MarkAsPaidStrategyEnum.TRANSACTION_FLOW}
          onCheckedChange={onMarkAsPaidStrategyChange}
          hasError={!!formErrors.markAsPaidStrategy}
          disabled={disabled}
        /> */}
        <Box />
        <Box __gridColumn="1 / 3" paddingX={6} >
          {/* 1. 다른 섹션과 구분하기 위해 위쪽에 스페이서를 추가합니다. */}
          <FormSpacer />
          {/* 2. 시각적인 구분을 위해 Divider를 추가합니다. */}
          <Divider />
          {/* 3. Divider와 내용 사이에 간격을 주기 위해 스페이서를 또 추가합니다. */}
          <FormSpacer />
          
          <Box display="flex" flexDirection="column" gap={2}>
            <Text size={4} fontWeight="bold">
              기본 적립률 설정
            </Text>
            <Text size={2} color="default2">
              이 채널에서 판매되는 상품에 적용될 기본 적립률을 퍼센트(%) 단위로 설정합니다. 상품별로 개별 적립률을 설정하면 이 값은 무시됩니다.
            </Text>
            <Box __width="50%" marginTop={2}> {/* 입력 필드와 설명 간의 간격을 조금 더 줍니다. */}
              <Input
                name="defaultRewardPointRate"
                data-test-id="reward-rate-input"
                value={data.defaultRewardPointRate}
                error={!!formErrors.defaultRewardPointRate}
                helperText={getChannelsErrorMessage(formErrors?.defaultRewardPointRate, intl)}
                type="number"
                onChange={onChange}
                disabled={disabled}
                min={0}
                max={100}
                endAdornment={<Text>%</Text>}
              />
            </Box>
          </Box>
        </Box>
        {/* <AllowUnpaidOrders
          onChange={onChange}
          isChecked={data.allowUnpaidOrders}
          hasError={!!formErrors.allowUnpaidOrders}
          disabled={disabled}
        />
        <Box />
        <DefaultTransactionFlowStrategy
          onChange={onTransactionFlowStrategyChange}
          isChecked={
            data.defaultTransactionFlowStrategy === TransactionFlowStrategyEnum.AUTHORIZATION
          }
          hasError={!!formErrors.defaultTransactionFlowStrategy}
          disabled={disabled}
        />
        <Box />
        <AutomaticallyCompleteCheckouts
          onChange={onAutomaticallyCompleteCheckoutsChange}
          hasError={!!formErrors.automaticallyCompleteCheckouts}
          isChecked={data.automaticallyCompleteCheckouts}
          disabled={disabled}
        /> */}
      </Box>
      <FormSpacer />
      <DashboardCard>
        <DashboardCard.Header>
          <DashboardCard.Title>
            {intl.formatMessage({
              id: "channelInfoSettingsTitle",
              defaultMessage: "안내 정보 설정",
              description: "channel information settings section header",
            })}
          </DashboardCard.Title>
        </DashboardCard.Header>
        <DashboardCard.Content>
          <Text size={2} color="default2" marginBottom={4}>
            {intl.formatMessage({
              id: "channelInfoSettingsDescription",
              defaultMessage: "스토어프론트의 상품 상세 페이지나 주문 관련 페이지에 표시될 공통 안내 문구를 입력합니다.",
            })}
          </Text>
          <Textarea
            name="paymentInfo"
            label={intl.formatMessage({
              id: "paymentInfoLabel",
              defaultMessage: "PAYMENT INFO (결제 안내)",
            })}
            width="100%"
            disabled={disabled}
            value={data.paymentInfo}
            onChange={onChange}
            error={!!formErrors.paymentInfo}
            helperText={getChannelsErrorMessage(formErrors.paymentInfo, intl)}
            data-test-id="payment-info-input"
          />
          <FormSpacer />
          <Textarea
            name="deliveryInfo"
            label={intl.formatMessage({
              id: "deliveryInfoLabel",
              defaultMessage: "DELIVERY INFO (배송 안내)",
            })}
            width="100%"
            disabled={disabled}
            value={data.deliveryInfo}
            onChange={onChange}
            error={!!formErrors.deliveryInfo}
            helperText={getChannelsErrorMessage(formErrors.deliveryInfo, intl)}
            data-test-id="delivery-info-input"
          />
          <FormSpacer />
          <Textarea
            name="exchangeInfo"
            label={intl.formatMessage({
              id: "exchangeInfoLabel",
              defaultMessage: "EXCHANGE INFO (교환/환불 안내)",
            })}
            width="100%"
            disabled={disabled}
            value={data.exchangeInfo}
            onChange={onChange}
            error={!!formErrors.exchangeInfo}
            helperText={getChannelsErrorMessage(formErrors.exchangeInfo, intl)}
            data-test-id="exchange-info-input"
          />
        </DashboardCard.Content>
      </DashboardCard>
    </>
  );
};
