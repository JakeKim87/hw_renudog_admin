import { OrderLineFragment } from "@dashboard/graphql";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  TextField, // 수량, 은행 선택 모두 이걸 사용
} from "@material-ui/core";
import { Box, Button, Input, Text } from "@saleor/macaw-ui-next"; // 일반 Input은 Macaw UI 사용해도 됨
import React, { useEffect, useState } from "react";

import { bankCodeOptions } from "../OrderCancelDialog/tossBankCodes";

export interface OrderLinePartialCancelFormData {
  quantity: number;
  refundBankCode?: string;
  refundAccountNumber?: string;
  refundHolderName?: string;
}

interface OrderLinePartialCancelDialogProps {
  open: boolean;
  line: OrderLineFragment | null;
  paymentMethodType?: string | null;
  onClose: () => void;
  onConfirm: (lineId: string, data: OrderLinePartialCancelFormData) => void;
}

export const OrderLinePartialCancelDialog: React.FC<OrderLinePartialCancelDialogProps> = ({
  open,
  line,
  paymentMethodType,
  onClose,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState<number | string>("");
  const [refundBankCode, setRefundBankCode] = useState("");
  const [refundAccountNumber, setRefundAccountNumber] = useState("");
  const [refundHolderName, setRefundHolderName] = useState("");

  const isVbank = paymentMethodType === "vbank";

  useEffect(() => {
    if (open) {
      setQuantity("");
      setRefundBankCode("");
      setRefundAccountNumber("");
      setRefundHolderName("");
    }
  }, [open]);

  if (!line) return null;

  const fulfilled = line.quantityFulfilled || 0;
  const maxQuantity = line.quantity - fulfilled;
  const quantityOptions = Array.from({ length: maxQuantity }, (_, i) => i + 1);

  const handleConfirm = () => {
    if (quantity === "" || quantity === 0) {
      alert("취소할 수량을 선택해주세요.");
      return;
    }

    if (isVbank) {
      if (!refundBankCode || !refundAccountNumber || !refundHolderName) {
        alert("환불 계좌 정보를 모두 입력해주세요.");
        return;
      }
    }

    onConfirm(line.id, {
      quantity: Number(quantity),
      refundBankCode: isVbank ? refundBankCode : undefined,
      refundAccountNumber: isVbank ? refundAccountNumber : undefined,
      refundHolderName: isVbank ? refundHolderName : undefined,
    });
    onClose();
  };

  // [공통 설정] 모든 드롭다운에 적용할 메뉴 속성 (Z-Index 보정)
  const menuPropsConfig = {
    style: { zIndex: 1400 }, // Dialog(1300)보다 높게 설정
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>상품 부분 취소</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <strong>{line.productName}</strong> 상품을 취소하시겠습니까?
          <br />
          취소할 수량을 선택해주세요. (최대 {maxQuantity}개)
        </DialogContentText>

        {/* 1. 수량 입력 (Material-UI TextField) */}
        <Box marginBottom={4} marginTop={2}>
          <TextField
            select
            fullWidth
            variant="outlined"
            size="small"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            SelectProps={{
              displayEmpty: true,
              MenuProps: menuPropsConfig,
            }}
          >
            <MenuItem value="" disabled>
              <span style={{ color: "#888" }}>취소할 수량을 선택하세요</span>
            </MenuItem>

            {quantityOptions.map(num => (
              <MenuItem key={num} value={num}>
                {num}개
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* 2. 가상계좌 환불 정보 */}
        {isVbank && (
          <Box
            display="flex"
            flexDirection="column"
            gap={3}
            marginTop={4}
            padding={3}
            backgroundColor="default2"
          >
            <Text fontWeight="bold" color="default2">
              가상계좌 환불 정보
            </Text>

            {/* [수정] 은행 선택도 Material-UI TextField로 변경 */}
            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              value={refundBankCode}
              onChange={e => setRefundBankCode(e.target.value as string)}
              SelectProps={{
                displayEmpty: true,
                MenuProps: { style: { zIndex: 1400 } },
              }}
            >
              <MenuItem value="" disabled>
                <span style={{ color: "#888" }}>환불 은행을 선택하세요</span>
              </MenuItem>

              {bankCodeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            {/* Input은 팝업창이 안 뜨므로 Macaw UI 그대로 써도 무방함 */}
            <Input
              label="계좌번호 ('-' 제외)"
              value={refundAccountNumber}
              onChange={e => setRefundAccountNumber(e.target.value)}
              size="small"
            />

            <Input
              label="예금주"
              value={refundHolderName}
              onChange={e => setRefundHolderName(e.target.value)}
              size="small"
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="tertiary">
          닫기
        </Button>
        <Button onClick={handleConfirm} variant="primary">
          취소 실행
        </Button>
      </DialogActions>
    </Dialog>
  );
};
