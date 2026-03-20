import { ConfirmButton, ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import { OrderErrorFragment } from "@dashboard/graphql";
import useModalDialogErrors from "@dashboard/hooks/useModalDialogErrors";
import getOrderErrorMessage from "@dashboard/utils/errors/order";
// 👇 Material-UI 컴포넌트 직접 사용
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  TextField,
} from "@material-ui/core";
import { Box, Input, Text } from "@saleor/macaw-ui-next";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { bankCodeOptions } from "./tossBankCodes";

export interface OrderCancelDialogFormData {
  refundBankCode?: string;
  refundAccountNumber?: string;
  refundHolderName?: string;
}

export interface OrderCancelDialogProps {
  confirmButtonState: ConfirmButtonTransitionState;
  errors: OrderErrorFragment[];
  number: string;
  open: boolean;
  paymentMethodType?: string | null;
  onClose: () => void;
  onSubmit: (data: OrderCancelDialogFormData) => void;
}

export const OrderCancelDialog: React.FC<OrderCancelDialogProps> = props => {
  const {
    confirmButtonState,
    errors: apiErrors,
    number: orderNumber,
    open,
    paymentMethodType,
    onSubmit,
    onClose,
  } = props;

  const intl = useIntl();
  const errors = useModalDialogErrors(apiErrors, open);
  const [formData, setFormData] = useState<OrderCancelDialogFormData>({});

  const isVbank = paymentMethodType === "vbank";

  useEffect(() => {
    if (!open) {
      setFormData({});
    }
  }, [open]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBankChange = (value: string) => {
    setFormData(prev => ({ ...prev, refundBankCode: value }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>주문 #{orderNumber} 취소</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <DialogContentText>
            <strong>중요:</strong> 주문을 취소하면 <strong>결제 취소</strong> 및{" "}
            <strong>재고 복구</strong>가 자동으로 진행됩니다.
          </DialogContentText>

          {/* --- 가상계좌일 경우에만 환불 정보 입력 폼 표시 --- */}
          {isVbank && (
            <Box display="grid" gap={4} marginTop={5} padding={2} backgroundColor="default2">
              <Text fontWeight="bold" color="default2">
                가상계좌 환불 정보 입력
              </Text>

              <TextField
                select
                fullWidth
                variant="outlined"
                size="small"
                value={formData.refundBankCode || ""}
                onChange={e => handleBankChange(e.target.value as string)}
                SelectProps={{
                  displayEmpty: true,
                  MenuProps: {
                    style: { zIndex: 1400 }, // Dialog(1300)보다 높게 설정
                    getContentAnchorEl: null, // 위치 고정
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  <span style={{ color: "#9ca3af" }}>환불 은행 선택</span>
                </MenuItem>

                {bankCodeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <Input
                label="계좌번호 ('-' 제외)"
                name="refundAccountNumber"
                value={formData.refundAccountNumber || ""}
                onChange={handleFieldChange}
                size="small" // Input 크기 통일
              />
              <Input
                label="예금주"
                name="refundHolderName"
                value={formData.refundHolderName || ""}
                onChange={handleFieldChange}
                size="small"
              />
            </Box>
          )}

          {errors.length > 0 && (
            <Box marginTop={4}>
              {errors.map((err, index) => (
                <Text display="block" color="critical1" key={index} data-test-id="dialog-error">
                  {getOrderErrorMessage(err, intl)}
                </Text>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="primary">
            주문 유지
          </Button>
          <ConfirmButton onClick={handleSubmit} transitionState={confirmButtonState} type="submit">
            주문 취소
          </ConfirmButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
OrderCancelDialog.displayName = "OrderCancelDialog";
export default OrderCancelDialog;
