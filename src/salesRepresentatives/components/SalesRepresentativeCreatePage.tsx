// @ts-strict-ignore
import { Backlink } from "@dashboard/components/Backlink";
import { CardSpacer } from "@dashboard/components/CardSpacer";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import Container from "@dashboard/components/Container";
import { Grid } from "@dashboard/components/Grid";
import PageHeader from "@dashboard/components/PageHeader";
import { Savebar } from "@dashboard/components/Savebar";
import { WindowTitle } from "@dashboard/components/WindowTitle";
import { AccountErrorFragment } from "@dashboard/graphql";
import { Card, CardContent, TextField } from "@material-ui/core";
import React from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

export interface SalesRepresentativeCreatePageFormData {
  name: string;
  phoneNumber: string;
  email: string;
}

const initialForm: SalesRepresentativeCreatePageFormData = {
  name: "",
  phoneNumber: "",
  email: "",
};

interface SalesRepresentativeCreatePageProps {
  disabled: boolean;
  saveButtonBarState: ConfirmButtonTransitionState;
  errors: AccountErrorFragment[];
  onBack: () => void;
  onSubmit: (data: SalesRepresentativeCreatePageFormData) => void;
}

const SalesRepresentativeCreatePage: React.FC<SalesRepresentativeCreatePageProps> = ({
  disabled,
  saveButtonBarState,
  errors, // 현재 UI에는 에러 매핑 로직이 없지만, 필요시 getFormErrors로 추가 가능
  onBack,
  onSubmit,
}) => {
  const intl = useIntl();

  // 1. React Hook Form 초기화
  const { register, handleSubmit, watch, formState } = useForm<SalesRepresentativeCreatePageFormData>({
    defaultValues: initialForm,
    mode: "onChange",
  });

  const { isDirty, isSubmitting } = formState;

  // 2. 입력값 실시간 감지 (TextField value용)
  const data = watch();

  return (
    <Container>
      <WindowTitle
        title={intl.formatMessage({ id: "create_rep", defaultMessage: "담당자 생성" })}
      />
      {/* 3. HTML form 태그로 감싸기 */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Backlink href="#" onClick={onBack}>
          담당자 목록
        </Backlink>
        <CardSpacer />
        <PageHeader title="새 담당자 생성" />
        <Grid>
          <div>
            <Card>
              <CardContent>
                <TextField
                  // 4. register 등록 (name="name" 등은 자동 처리됨)
                  {...register("name", { required: true })}
                  label={"이름"}
                  value={data.name} // watch 값 사용
                  required // HTML required 속성 (UI 표시용)
                  fullWidth
                  disabled={disabled}
                />
                <CardSpacer />
                <TextField
                  {...register("phoneNumber")}
                  label={"전화번호"}
                  value={data.phoneNumber}
                  fullWidth
                  disabled={disabled}
                />
                <CardSpacer />
                <TextField
                  {...register("email")}
                  label={"이메일"}
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
          <Savebar.CancelButton onClick={onBack} />
          <Savebar.ConfirmButton
            transitionState={saveButtonBarState}
            // 5. Submit 핸들러 연결
            onClick={handleSubmit(onSubmit)}
            // 변경사항이 없거나(isDirty false), 제출 중이면 비활성화
            disabled={disabled || isSubmitting || !isDirty}
          >
            저장
          </Savebar.ConfirmButton>
        </Savebar>
      </form>
    </Container>
  );
};

SalesRepresentativeCreatePage.displayName = "SalesRepresentativeCreatePage";
export default SalesRepresentativeCreatePage;