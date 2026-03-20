import { ConfirmButton, ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import { OrderErrorFragment } from "@dashboard/graphql"; // useTrackingCompanyListQuery 제거
import useModalDialogErrors from "@dashboard/hooks/useModalDialogErrors";
import { buttonMessages } from "@dashboard/intl";
import { getFormErrors } from "@dashboard/utils/errors";
import getOrderErrorMessage from "@dashboard/utils/errors/order";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography // 텍스트 표시용 추가
} from "@material-ui/core";
import { Box, Text } from "@saleor/macaw-ui-next";
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

export interface FormData {
  trackingNumber: string;
  trackingCompanyCode: string;
}

export interface OrderFulfillmentTrackingDialogProps {
  confirmButtonState: ConfirmButtonTransitionState;
  errors: OrderErrorFragment[];
  open: boolean;
  trackingNumber: string;
  trackingCompanyCode?: string;
  onClose: () => any;
  onConfirm: (data: FormData) => any;
}

const OrderFulfillmentTrackingDialog: React.FC<OrderFulfillmentTrackingDialogProps> = ({
  confirmButtonState,
  errors: apiErrors,
  open,
  trackingNumber,
  onConfirm,
  onClose,
}) => {
  const intl = useIntl();
  const errors = useModalDialogErrors(apiErrors, open);
  
  // trackingCompanyCode는 이제 UI에서 에러를 체크할 필요가 없으므로 formFields에서 제외
  const formFields = ["trackingNumber"];
  const formErrors = getFormErrors(formFields, errors);

  const [localTrackingNumber, setLocalTrackingNumber] = useState("");

  // CJ 대한통운 코드 고정
  const FIXED_COMPANY_CODE = "08";

  useEffect(() => {
    if (open) {
      setLocalTrackingNumber(trackingNumber || "");
    }
  }, [open, trackingNumber]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    onConfirm({
      trackingNumber: localTrackingNumber,
      trackingCompanyCode: FIXED_COMPANY_CODE, // 04로 고정하여 전송
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>배송 정보 입력</DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} paddingTop={1}>
            
            {/* 택배사 선택 Select 제거됨 */}
            
            {/* 사용자에게 고정된 택배사를 알려주기 위한 표시 (선택사항, 필요 없으면 삭제 가능) */}
            <TextField
              fullWidth
              variant="outlined"
              label="택배사"
              value="롯데택배"
              disabled
              inputProps={{ style: { cursor: 'default' } }}
            />

            <TextField
              fullWidth
              label={intl.formatMessage({
                id: "yT/GAp",
                defaultMessage: "Tracking number",
              })}
              variant="outlined"
              value={localTrackingNumber}
              onChange={(e) => setLocalTrackingNumber(e.target.value)}
              error={!!formErrors.trackingNumber}
              helperText={getOrderErrorMessage(formErrors.trackingNumber, intl)}
              autoFocus // 팝업 열리면 바로 송장번호에 포커스
            />

            {errors.length > 0 && (
              <Box>
                {errors
                  .filter(err => err.field && !formFields.includes(err.field))
                  .map((err, index) => (
                    <Text display="block" color="critical1" key={index}>
                      {getOrderErrorMessage(err, intl)}
                    </Text>
                  ))}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="primary">
            <FormattedMessage {...buttonMessages.back} />
          </Button>
          <ConfirmButton
            transitionState={confirmButtonState}
            type="submit" 
            onClick={handleSubmit}
          >
            <FormattedMessage {...buttonMessages.confirm} />
          </ConfirmButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

OrderFulfillmentTrackingDialog.displayName = "OrderFulfillmentTrackingDialog";
export default OrderFulfillmentTrackingDialog;