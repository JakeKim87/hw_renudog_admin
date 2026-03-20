import { ConfirmButton, ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import {
  AgencyTransferFragment,
  AgencyTransferStatusEnum,
  AgencyTransferUpdateInput,
} from "@dashboard/graphql";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";

interface AgencyTransferUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (input: AgencyTransferUpdateInput) => void;
  transfer: AgencyTransferFragment | undefined;
  confirmButtonState: ConfirmButtonTransitionState;
}

const AgencyTransferUpdateDialog: React.FC<AgencyTransferUpdateDialogProps> = ({
  open,
  onClose,
  onConfirm,
  transfer,
  confirmButtonState,
}) => {
  const [formData, setFormData] = useState<AgencyTransferUpdateInput>({
    status: AgencyTransferStatusEnum.PENDING,
    trackingNumber: "",
    carrier: "롯데택배", // 기본값 고정
    adminNote: "",
  });

  useEffect(() => {
    if (transfer) {
      setFormData({
        status: transfer.status,
        trackingNumber: transfer.trackingNumber || "",
        carrier: "롯데택배", // 업데이트 시에도 항상 롯데택배로 고정
        adminNote: transfer.adminNote || "",
      });
    }
  }, [transfer, open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onConfirm(formData);
  };

  if (!transfer) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>출고 요청 처리 #{transfer.number}</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="상태"
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{ marginBottom: 16 }}
          >
            <MenuItem value={AgencyTransferStatusEnum.PENDING}>준비중</MenuItem>
            <MenuItem value={AgencyTransferStatusEnum.SHIPPED}>배송중</MenuItem>
            <MenuItem value={AgencyTransferStatusEnum.DELIVERED}>배송완료</MenuItem>
            <MenuItem value={AgencyTransferStatusEnum.CANCELLED}>취소됨</MenuItem>
          </TextField>

          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
            배송사: 롯데택배
          </Typography>

          <TextField
            fullWidth
            label="송장 번호"
            name="trackingNumber"
            value={formData.trackingNumber}
            onChange={handleChange}
            style={{ marginBottom: 16 }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="관리자 메모"
            name="adminNote"
            value={formData.adminNote}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>취소</Button>
          <ConfirmButton type="submit" transitionState={confirmButtonState}>
            저장
          </ConfirmButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AgencyTransferUpdateDialog;
