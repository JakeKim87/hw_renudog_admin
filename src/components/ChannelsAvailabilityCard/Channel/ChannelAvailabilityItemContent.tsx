// @ts-strict-ignore
import { ChannelData } from "@dashboard/channels/utils";
import { DateTimeTimezoneField } from "@dashboard/components/DateTimeTimezoneField";
import { StopPropagation } from "@dashboard/components/StopPropagation";
import useCurrentDate from "@dashboard/hooks/useCurrentDate";
import { getFormErrors, getProductErrorMessage } from "@dashboard/utils/errors";
import { Box, Checkbox, Divider, RadioGroup, Text } from "@saleor/macaw-ui-next";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import { ChannelOpts, ChannelsAvailabilityError, Messages } from "../types";
import { availabilityItemMessages } from "./messages";

export interface ChannelContentProps {
  disabled?: boolean;
  data: ChannelData;
  errors: ChannelsAvailabilityError[];
  messages: Messages;
  onChange: (id: string, data: ChannelOpts) => void;
}

export const ChannelAvailabilityItemContent: React.FC<ChannelContentProps> = ({
  data,
  disabled,
  errors,
  messages, // 이거 무시하고 직접 텍스트 넣겠습니다.
  onChange,
}) => {
  const {
    availableForPurchaseAt,
    isAvailableForPurchase: isAvailable,
    isPublished,
    publishedAt,
    visibleInListings,
    id,
  } = data;

  const formData = {
    ...(availableForPurchaseAt !== undefined ? { availableForPurchaseAt } : {}),
    ...(isAvailable !== undefined ? { isAvailableForPurchase: isAvailable } : {}),
    isPublished,
    publishedAt,
    ...(visibleInListings !== undefined ? { visibleInListings } : {}),
  };

  const dateNow = useCurrentDate();
  const [isPublishedAt, setPublishedAt] = useState(!!publishedAt);
  const [isAvailableDate, setAvailableDate] = useState(false);
  const intl = useIntl();
  const formErrors = getFormErrors(["availableForPurchaseAt", "publishedAt"], errors);

  return (
    <StopPropagation>
      <Box display="flex" gap={3} paddingTop={3} flexDirection="column">
        {/* 공개 여부 라디오 버튼 그룹 */}
        <RadioGroup
          value={String(isPublished)} // 여기가 "true" 또는 "false"여야 함
          onValueChange={value => {
            // 클릭 시 부모에게 변경 요청
            onChange(id, {
              ...formData,
              isPublished: value === "true",
              publishedAt: value === "false" ? null : publishedAt,
            });
          }}
          disabled={disabled}
          display="flex"
          flexDirection="column"
          gap={3}
        >
          {/* 공개 버튼 */}
          <RadioGroup.Item id={`${id}-isPublished-true`} value="true" name="isPublished">
            <Box display="flex" alignItems="baseline" gap={2}>
              {/* ✅ 텍스트 한글로 고정 */}
              <Text>공개</Text> 
            </Box>
          </RadioGroup.Item>

          {/* 비공개 버튼 */}
          <RadioGroup.Item id={`${id}-isPublished-false`} value="false" name="isPublished">
            <Box display="flex" alignItems="baseline" gap={2}>
              {/* ✅ 텍스트 한글로 고정 */}
              <Text>비공개</Text>
            </Box>
          </RadioGroup.Item>
        </RadioGroup>

        {/* 비공개 선택 시 날짜 지정 옵션 */}
        {!isPublished && (
          <Box display="flex" flexDirection="column" alignItems="start" gap={1}>
            <Checkbox
              onCheckedChange={(checked: boolean) => setPublishedAt(checked)}
              checked={isPublishedAt}
            >
              {/* 여기도 한글로 고정 가능 */}
              <Text>공개 날짜 설정</Text>
            </Checkbox>
            {isPublishedAt && (
              <DateTimeTimezoneField
                error={!!formErrors.publishedAt}
                helperText={
                  formErrors.publishedAt ? getProductErrorMessage(formErrors.publishedAt, intl) : ""
                }
                disabled={disabled}
                name={`channel:publicationTime:${id}`}
                value={publishedAt || ""}
                onChange={dateTime =>
                  onChange(id, {
                    ...formData,
                    publishedAt: dateTime,
                  })
                }
                fullWidth
              />
            )}
          </Box>
        )}
      </Box>
    </StopPropagation>
  );
};