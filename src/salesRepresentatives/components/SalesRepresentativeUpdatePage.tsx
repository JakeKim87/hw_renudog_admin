// @ts-strict-ignore
import { Backlink } from "@dashboard/components/Backlink";
import CardSpacer from "@dashboard/components/CardSpacer";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import Container from "@dashboard/components/Container";
// ❌ 기존 Form 제거
// import Form from "@dashboard/components/Form";
import { Grid } from "@dashboard/components/Grid";
import PageHeader from "@dashboard/components/PageHeader";
import { Savebar } from "@dashboard/components/Savebar";
import { WindowTitle } from "@dashboard/components/WindowTitle";
import {
  AccountErrorFragment,
  SalesRepresentativeDetailsQuery,
} from "@dashboard/graphql";
import { Card, CardContent, TextField } from "@material-ui/core";
import React, { useEffect } from "react";
// ✅ React Hook Form 추가
import { useForm } from "react-hook-form";

type RepFragment = NonNullable<SalesRepresentativeDetailsQuery["salesRepresentative"]>;

export interface SalesRepresentativeUpdatePageFormData {
  name: string;
  phoneNumber: string;
  email: string;
}

interface SalesRepresentativeUpdatePageProps {
  rep: RepFragment;
  disabled: boolean;
  saveButtonBarState: ConfirmButtonTransitionState;
  errors: AccountErrorFragment[];
  onBack: () => void;
  onSubmit: (data: SalesRepresentativeUpdatePageFormData) => void;
  onDelete: () => void;
}

const SalesRepresentativeUpdatePage: React.FC<SalesRepresentativeUpdatePageProps> = ({
  rep,
  disabled,
  saveButtonBarState,
  errors,
  onBack,
  onSubmit,
  onDelete,
}) => {
  
  // 초기값 설정
  const initialForm: SalesRepresentativeUpdatePageFormData = {
    name: rep?.name || "",
    phoneNumber: rep?.phoneNumber || "",
    email: rep?.email || "",
  };

  // 1. React Hook Form 초기화
  const { register, handleSubmit, watch, formState, reset } = useForm<SalesRepresentativeUpdatePageFormData>({
    defaultValues: initialForm,
    mode: "onChange",
  });

  const { isDirty, isSubmitting } = formState;

  // 2. DB에서 불러온 데이터(rep)가 변경되면 폼을 리셋하여 값을 채워줌 (매우 중요)
  useEffect(() => {
    reset(initialForm);
  }, [rep?.id, rep?.name, rep?.phoneNumber, rep?.email]); // rep 객체가 업데이트될 때마다 실행

  // 3. 입력값 실시간 감지 (TextField value용)
  const data = watch();

  return (
    <Container>
      <WindowTitle title={rep?.name} />
      {/* 4. HTML form 태그 + handleSubmit 적용 */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Backlink href="#" onClick={onBack}>
          담당자 목록
        </Backlink>
        <CardSpacer />
        <PageHeader title={`담당자 ${rep?.name}`} />
        <Grid>
          <div>
            <Card>
              <CardContent>
                <TextField
                  // 5. register 등록
                  {...register("name", { required: true })}
                  label="이름"
                  value={data.name} // watch 값 사용
                  required
                  fullWidth
                  disabled={disabled}
                />
                <CardSpacer />
                <TextField
                  {...register("phoneNumber")}
                  label="전화번호"
                  value={data.phoneNumber}
                  fullWidth
                  disabled={disabled}
                />
                <CardSpacer />
                <TextField
                  {...register("email")}
                  label="이메일"
                  type="email"
                  value={data.email}
                  fullWidth
                  disabled={disabled}
                />
              </CardContent>
            </Card>
          </div>
          <div />
        </Grid>
        <Savebar>
          <Savebar.DeleteButton onClick={onDelete} />
          <Savebar.CancelButton onClick={onBack} />
          <Savebar.ConfirmButton
            transitionState={saveButtonBarState}
            onClick={handleSubmit(onSubmit)}
            // 변경사항이 없거나(isDirty false) 제출 중이면 비활성화
            disabled={disabled || isSubmitting || !isDirty}
          >
            변경사항 저장
          </Savebar.ConfirmButton>
        </Savebar>
      </form>
    </Container>
  );
};

SalesRepresentativeUpdatePage.displayName = "SalesRepresentativeUpdatePage";
export default SalesRepresentativeUpdatePage;