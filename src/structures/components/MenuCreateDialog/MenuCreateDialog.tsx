// @ts-strict-ignore
import BackButton from "@dashboard/components/BackButton";
import { ConfirmButton, ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import { DashboardModal } from "@dashboard/components/Modal";
import { MenuErrorFragment } from "@dashboard/graphql";
import { buttonMessages } from "@dashboard/intl";
import { getFormErrors } from "@dashboard/utils/errors";
import getMenuErrorMessage from "@dashboard/utils/errors/menu";
import { TextField } from "@material-ui/core";
import { Box } from "@saleor/macaw-ui-next";
import React from "react";
import { useForm } from "react-hook-form"; 
import { FormattedMessage, useIntl } from "react-intl";

export interface MenuCreateDialogFormData {
  name: string;
}

export interface MenuCreateDialogProps {
  confirmButtonState: ConfirmButtonTransitionState;
  disabled: boolean;
  errors: MenuErrorFragment[];
  open: boolean;
  onClose: () => void;
  onConfirm: (data: MenuCreateDialogFormData) => void;
}

const initialForm: MenuCreateDialogFormData = {
  name: "",
};

const MenuCreateDialog: React.FC<MenuCreateDialogProps> = ({
  confirmButtonState,
  disabled,
  errors,
  onClose,
  onConfirm,
  open,
}) => {
  const intl = useIntl();
  const formErrors = getFormErrors(["name"], errors);

  // 1. React Hook Form 초기화
  const { register, handleSubmit, watch } = useForm<MenuCreateDialogFormData>({
    defaultValues: initialForm,
  });

  // 2. 값 실시간 감시 (TextField의 value에 넣기 위함)
  const nameValue = watch("name");

  return (
    <DashboardModal onChange={onClose} open={open}>
      <DashboardModal.Content size="sm">
        {/* 3. HTML form 태그 + handleSubmit 적용 */}
        <form onSubmit={handleSubmit(onConfirm)}>
          <Box display="grid" gap={6}>
            <DashboardModal.Header data-test-id="create-menu-dialog-title">
              <FormattedMessage
                id="pSb46V"
                defaultMessage="Create structure"
                description="dialog header"
              />
            </DashboardModal.Header>

            <TextField
              data-test-id="menu-name-input"
              disabled={disabled}
              error={!!formErrors.name}
              fullWidth
              helperText={getMenuErrorMessage(formErrors.name, intl)}
              label={intl.formatMessage({
                id: "5KS3f4",
                defaultMessage: "Structure title",
              })}
              // 4. register 연결 (name, onChange, onBlur 자동 처리)
              {...register("name")}
              // watch로 가져온 값을 넣어줘야 입력 시 화면에 보입니다 (MUI 특성)
              value={nameValue}
            />

            <DashboardModal.Actions>
              <BackButton onClick={onClose} />
              <ConfirmButton
                transitionState={confirmButtonState}
                // 5. 버튼 타입을 submit으로 지정
                type="submit"
                data-test-id="submit"
              >
                <FormattedMessage {...buttonMessages.save} />
              </ConfirmButton>
            </DashboardModal.Actions>
          </Box>
        </form>
      </DashboardModal.Content>
    </DashboardModal>
  );
};

MenuCreateDialog.displayName = "MenuCreateDialog";
export default MenuCreateDialog;