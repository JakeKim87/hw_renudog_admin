// src/products/components/ProductVisibility/ProductVisibility.tsx

import { DashboardCard } from "@dashboard/components/Card";
import { ProductErrorFragment, ProductVisibilityEnum } from "@dashboard/graphql";
import { getFormErrors, getProductErrorMessage } from "@dashboard/utils/errors";
import {
  Box,
  // 수정: FormControl 제거
  Multiselect,
  Option,
  RadioGroup,
  Text,
} from "@saleor/macaw-ui-next";
import React from "react";
import { useIntl } from "react-intl";

interface MembershipTier {
  id: string;
  grade: string;
}

interface ProductVisibilityProps {
  data: {
    visibility: string;
    visibleForTiers: string[];
    visibleForUserTypes: string[];
  };
  disabled: boolean;
  errors: ProductErrorFragment[];
  membershipTiers: MembershipTier[];
  onChange: (event: { target: { name: string; value: any } }) => void;
}

const ProductVisibility: React.FC<ProductVisibilityProps> = ({
  data,
  disabled,
  errors,
  membershipTiers,
  onChange,
}) => {
  const intl = useIntl();
  const formErrors = getFormErrors(
    ["visibility", "visibleForTiers", "visibleForUserTypes"],
    errors,
  );

  const tierChoices =
    membershipTiers?.map(tier => ({
      label: tier.grade,
      value: tier.id,
    })) ?? [];

  const selectedTierOptions = tierChoices.filter(choice =>
    (data.visibleForTiers || []).includes(choice.value),
  );

  const userTypeChoices = [
    { label: "병원", value: "HOSPITAL" },
    { label: "대리점", value: "AGENCY" },
  ];

  const selectedUserTypeOptions = userTypeChoices.filter(choice =>
    (data.visibleForUserTypes || []).includes(choice.value),
  );

  return (
    <DashboardCard>
      <DashboardCard.Header>
        <DashboardCard.Title>상품 공개 설정</DashboardCard.Title>
      </DashboardCard.Header>
      <DashboardCard.Content>
        <RadioGroup
          name="visibility"
          disabled={disabled}
          value={data.visibility}
          onValueChange={value => {
            onChange({
              target: { name: "visibility", value },
            });
          }}
          error={!!formErrors.visibility}
        >
          <RadioGroup.Item id={ProductVisibilityEnum.PUBLIC} value={ProductVisibilityEnum.PUBLIC}>
            <Box>
              <Text>공개</Text>
              <Text size={2} color="default2">
                모든 사용자에게 상품이 노출됩니다.
              </Text>
            </Box>
          </RadioGroup.Item>
          <RadioGroup.Item id={ProductVisibilityEnum.PRIVATE} value={ProductVisibilityEnum.PRIVATE}>
            <Box>
              <Text>비공개</Text>
              <Text size={2} color="default2">
                관리자를 제외한 모든 사용자에게 상품이 숨겨집니다.
              </Text>
            </Box>
          </RadioGroup.Item>
          <RadioGroup.Item
            id={ProductVisibilityEnum.CONDITIONAL}
            value={ProductVisibilityEnum.CONDITIONAL}
          >
            <Box>
              <Text>조건부 공개</Text>
              <Text size={2} color="default2">
                지정된 멤버십 등급을 가진 사용자에게만 상품이 노출됩니다.
              </Text>
            </Box>
          </RadioGroup.Item>
        </RadioGroup>

        {data.visibility === ProductVisibilityEnum.CONDITIONAL && (
          <>
            {/* <Box marginTop={4}>
              <Multiselect
                name="visibleForTiers"
                label="멤버십 등급 선택"
                disabled={disabled}
                options={tierChoices}
                value={selectedTierOptions}
                onChange={selectedOptions => {
                  const selectedIds = selectedOptions.map(option => option.value);
                  onChange({
                    target: { name: "visibleForTiers", value: selectedIds },
                  });
                }}
                error={!!formErrors.visibleForTiers}
                helperText={getProductErrorMessage(formErrors.visibleForTiers, intl)}
              />
            </Box> */}

            {/* ▼▼▼ 회원 타입 선택 UI 추가 ▼▼▼ */}
            <Box marginTop={4}>
              <Multiselect
                name="visibleForUserTypes"
                label="회원 타입 선택"
                disabled={disabled}
                options={userTypeChoices}
                value={selectedUserTypeOptions}
                onChange={selectedOptions => {
                  const selectedValues = selectedOptions.map(option => option.value);
                  onChange({
                    target: { name: "visibleForUserTypes", value: selectedValues },
                  });
                }}
                error={!!formErrors.visibleForUserTypes}
                helperText={getProductErrorMessage(formErrors.visibleForUserTypes, intl)}
              />
            </Box>
          </>
        )}
      </DashboardCard.Content>
    </DashboardCard>
  );
};

export default ProductVisibility;
