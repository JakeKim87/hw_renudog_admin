import ActionDialog from "@dashboard/components/ActionDialog";
import NotFoundPage from "@dashboard/components/NotFoundPage";
import {
  useMembershipTierDeleteMutation,
  useMembershipTierDetailsQuery,
  useMembershipTierUpdateMutation,
} from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import React from "react";

import MembershipTierUpdatePage, {
  MembershipTierUpdatePageFormData,
} from "../../components/MembershipTierUpdatePage";
import {
  membershipTierListUrl,
  membershipTierUrl,
  MembershipTierUrlQueryParams,
} from "../../urls";

interface MembershipTierUpdateProps {
  id: string;
  params: MembershipTierUrlQueryParams;
}

export const MembershipTierUpdate: React.FC<MembershipTierUpdateProps> = ({
  id,
  params,
}) => {
  const navigate = useNavigator();
  const notify = useNotifier();

  // 1. 등급 상세 정보 조회
  const { data, loading } = useMembershipTierDetailsQuery({
    displayLoader: true,
    variables: { id },
  });

  // 2. 등급 수정 뮤테이션
  const [updateTier, updateTierOpts] = useMembershipTierUpdateMutation({
    onCompleted: data => {
      if (data.membershipTierUpdate.errors.length === 0) {
        notify({
          status: "success",
          text: "회원 등급이 성공적으로 수정되었습니다.",
        });
      }
    },
  });

  // 3. 등급 삭제 뮤테이션
  const [deleteTier, deleteTierOpts] = useMembershipTierDeleteMutation({
    onCompleted: data => {
      if (data.membershipTierDelete.errors.length === 0) {
        notify({
          status: "success",
          text: "회원 등급이 성공적으로 삭제되었습니다.",
        });
        navigate(membershipTierListUrl()); // 삭제 후 목록으로 이동
      }
    },
  });

  const tier = data?.membershipTier;

  // 데이터가 없으면 404 페이지 표시
  if (tier === null) {
    return <NotFoundPage onBack={() => navigate(membershipTierListUrl())} />;
  }

  // 4. 핸들러 함수 정의
  const handleSubmit = (formData: MembershipTierUpdatePageFormData) => {
    updateTier({
      variables: {
        id,
        // 수정 시에는 grade를 보내지 않습니다. (백엔드에서 막혀있음)
        input: {
          grade: tier.grade, // grade는 필수지만, 백엔드에서 무시됩니다.
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

  const handleDelete = () => {
    deleteTier({ variables: { id } });
  };

  return (
    <>
      <MembershipTierUpdatePage
        tier={tier}
        disabled={loading || updateTierOpts.loading}
        saveButtonBarState={updateTierOpts.status}
        onBack={() => navigate(membershipTierListUrl())}
        onSubmit={handleSubmit}
        onDelete={() => navigate(membershipTierUrl(id, { action: "remove" }))}
        errors={updateTierOpts.data?.membershipTierUpdate.errors || []}
      />
      <ActionDialog
        open={params.action === "remove"}
        onClose={() => navigate(membershipTierUrl(id))}
        onConfirm={handleDelete}
        title="회원 등급 삭제"
        variant="delete"
        confirmButtonState={deleteTierOpts.status}
      >
        정말로 이 등급을 삭제하시겠습니까? 이 등급을 가진 회원은 등급이 없어집니다.
      </ActionDialog>
    </>
  );
};

export default MembershipTierUpdate;