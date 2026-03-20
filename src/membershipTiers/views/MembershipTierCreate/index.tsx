// src/membershipTiers/views/MembershipTierCreate/index.tsx

import { useMembershipTierCreateMutation } from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import React from "react";

import MembershipTierCreatePage, {
  MembershipTierCreatePageFormData,
} from "../../components/MembershipTierCreatePage";
import { membershipTierListUrl, membershipTierUrl } from "../../urls";

export const MembershipTierCreate: React.FC = () => {
  const navigate = useNavigator();
  const notify = useNotifier();

  const [createTier, createTierOpts] = useMembershipTierCreateMutation({
    onCompleted: data => {
      if (data.membershipTierCreate.errors.length === 0) {
        notify({
          status: "success",
          text: "회원 등급이 성공적으로 생성되었습니다.",
        });
        // 생성된 등급의 상세 페이지로 이동
        navigate(membershipTierUrl(data.membershipTierCreate.membershipTier.id));
      }
    },
  });

  const handleSubmit = (formData: MembershipTierCreatePageFormData) => {
    createTier({
      variables: {
        input: {
          grade: formData.grade,
          // 폼에서 받은 문자열 값을 숫자로 변환하여 전송합니다.
          withoutQ: parseInt(formData.withoutQ, 10),
          withQ: parseInt(formData.withQ, 10),
          preserve: parseInt(formData.preserve, 10),
          earningRate: parseFloat(formData.earningRate),
          withoutQDiscountRate: parseFloat(formData.withoutQDiscountRate),
          withQDiscountRate: parseFloat(formData.withQDiscountRate),
          preserveDiscountRate: parseFloat(formData.preserveDiscountRate),
          tokenDiscountRate: parseFloat(formData.tokenDiscountRate),
        },
      },
    });
  };

  return (
    <MembershipTierCreatePage
      disabled={createTierOpts.loading}
      saveButtonBarState={createTierOpts.status}
      onBack={() => navigate(membershipTierListUrl())}
      onSubmit={handleSubmit}
      errors={createTierOpts.data?.membershipTierCreate.errors || []}
    />
  );
};

export default MembershipTierCreate;