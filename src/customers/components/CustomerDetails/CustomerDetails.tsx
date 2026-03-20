// @ts-strict-ignore
import { MutationResult } from "@apollo/client";
import { DashboardCard } from "@dashboard/components/Card";
import { ConfirmButton } from "@dashboard/components/ConfirmButton";
import {
  AccountErrorFragment,
  CustomerDetailsQuery,
  UpdateCustomerEmailByStaffMutationResult,
} from "@dashboard/graphql";
import { getFormErrors } from "@dashboard/utils/errors";
import getAccountErrorMessage from "@dashboard/utils/errors/account";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
} from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";
import { Box, Checkbox, Skeleton, Text } from "@saleor/macaw-ui-next"; // Box 추가
import moment from "moment-timezone";
import React, { useState } from "react";
import { useIntl } from "react-intl";

const useStyles = makeStyles(
  theme => ({
    // cardTitle의 최소 높이를 조절하여 더 많은 정보를 담을 수 있게 합니다.
    cardTitle: {
      minHeight: 72,
    },
    checkbox: {
      marginBottom: theme.spacing(),
    },
    content: {
      paddingTop: theme.spacing(),
    },
    // subtitle 클래스는 이제 "Active member since"에만 사용됩니다.
    subtitle: {
      marginTop: theme.spacing(2), // 메인 정보와 간격을 띄웁니다.
    },
    emailContainer: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(2),
    },
  }),
  { name: "CustomerDetails" },
);

export interface CustomerDetailsProps {
  // codegen 실행 후 customer 타입에는 businessName 등이 포함되어야 합니다.
  customer: CustomerDetailsQuery["user"];
  data: {
    isActive: boolean;
    note: string;
  };
  disabled: boolean;
  errors: AccountErrorFragment[];
  onChange: (event: React.ChangeEvent<any>) => void;
  onEmailUpdate: (email: string) => Promise<any>;
  updateEmailOpts: UpdateCustomerEmailByStaffMutationResult;
}

const EmailUpdateDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: (email: string) => void;
  initialEmail: string;
  opts: MutationResult;
}> = ({ open, onClose, onConfirm, initialEmail, opts }) => {
  const intl = useIntl();
  const [email, setEmail] = useState(initialEmail);
  const error = opts.data?.accountEmailUpdateByStaff.errors[0];

  const handleSubmit = () => {
    onConfirm(email);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>이메일 주소 변경</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="새 이메일 주소"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={!!error}
          helperText={getAccountErrorMessage(error, intl)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <ConfirmButton
          transitionState={opts.loading ? "loading" : "default"}
          onClick={handleSubmit}
        >
          확인
        </ConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

const CustomerDetails: React.FC<CustomerDetailsProps> = props => {
  const { customer, data, disabled, errors, onChange, onEmailUpdate, updateEmailOpts } = props;

  const classes = useStyles(props);
  const intl = useIntl();
  const [isEmailDialogOpen, setEmailDialogOpen] = useState(false);

  const formErrors = getFormErrors(["note"], errors);

  const handleEmailUpdateConfirm = async (email: string) => {
    const result = await onEmailUpdate(email);
    if (result.data?.accountEmailUpdateByStaff.errors.length === 0) {
      setEmailDialogOpen(false);
    }
  };

  return (
    <DashboardCard>
      <DashboardCard.Header>
        <DashboardCard.Title
          className={classes.cardTitle}
          display="flex"
          flexDirection="column"
          justifyContent="center" // 세로 중앙 정렬
        >
          {customer ? (
            <>
              {/* 메인 타이틀: 병원명 (없을 경우 이메일을 fallback으로 표시) */}
              <Text size={5} fontWeight="bold">
                {customer.businessName || customer.email}
              </Text>

              {/* 서브 정보: 대표원장, 병원전화번호, 이메일 */}
              <Box display="flex" flexDirection="column" gap={1} marginTop={2}>
                <Text size={2} color="default2">
                  대표원장: {customer.representativeName || "정보 없음"}
                </Text>
                <Text size={2} color="default2">
                  병원 전화번호: {customer.businessPhone || "정보 없음"}
                </Text>
                {/* 병원명이 있을 경우에만 이메일을 서브 정보로 표시 */}
                {customer?.businessName && (
                  <Box className={classes.emailContainer}>
                    <Text size={2} color="default2">
                      이메일: {customer.email}
                    </Text>
                    <Button
                      variant="text"
                      color="primary"
                      size="small"
                      onClick={() => setEmailDialogOpen(true)}
                      disabled={disabled}
                    >
                      변경
                    </Button>
                  </Box>
                )}
              </Box>

              {/* 가입일 정보 */}
              <Text className={classes.subtitle} size={2} fontWeight="light">
                가입일 : {moment(customer.dateJoined).format("YYYY-MM-DD")}
              </Text>
            </>
          ) : (
            // 로딩 중 스켈레톤 UI
            <>
              <Skeleton style={{ width: "20rem" }} />
              <Skeleton style={{ width: "15rem", marginTop: "8px" }} />
              <Skeleton style={{ width: "10rem", marginTop: "16px" }} />
            </>
          )}
        </DashboardCard.Title>
      </DashboardCard.Header>
      <DashboardCard.Content className={classes.content}>
        <Box marginBottom={4}>
          <Text size={2} fontWeight="bold" color="default2">
            가입 증빙 서류
          </Text>
          <Box marginTop={2} display="flex" flexDirection="column" gap={1}>
            {customer?.documents && customer.documents.length > 0 ? (
              customer.documents.map(doc => (
                <Box
                  key={doc.id}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  paddingX={3}
                  paddingY={2}
                  backgroundColor="default1"
                  borderRadius={2}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    {/* PaperClipIcon 등 파일 아이콘 */}
                    <Text size={2} style={{ wordBreak: "break-all" }}>
                      {doc.fileName || "제출 파일"}
                    </Text>
                  </Box>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => window.open(doc.fileUrl, "_blank")}
                  >
                    보기
                  </Button>
                </Box>
              ))
            ) : (
              <Box paddingY={2}>
                <Text size={2} color="default2">
                  제출된 증빙 서류가 없습니다.
                </Text>
              </Box>
            )}
          </Box>
          <Divider style={{ marginTop: "16px" }} />
        </Box>

        <Checkbox
          data-test-id="customer-active-checkbox"
          checked={data.isActive}
          className={classes.checkbox}
          disabled={disabled}
          name="isActive"
          onCheckedChange={value => {
            onChange({
              target: {
                name: "isActive",
                value,
              },
            } as React.ChangeEvent<any>);
          }}
        >
          <Text fontSize={3}>
            {intl.formatMessage({
              id: "+NUzaQ",
              defaultMessage: "User account active",
              description: "check to mark this account as active",
            })}
          </Text>
        </Checkbox>
        <TextField
          data-test-id="customer-note"
          disabled={disabled}
          error={!!formErrors.note}
          fullWidth
          multiline
          helperText={getAccountErrorMessage(formErrors.note, intl)}
          name="note"
          label={intl.formatMessage({
            id: "uUQ+Al",
            defaultMessage: "Note",
            description: "note about customer",
          })}
          value={data.note}
          onChange={onChange}
        />
      </DashboardCard.Content>
      {customer && (
        <EmailUpdateDialog
          open={isEmailDialogOpen}
          onClose={() => setEmailDialogOpen(false)}
          onConfirm={handleEmailUpdateConfirm}
          initialEmail={customer.email}
          opts={updateEmailOpts}
        />
      )}
    </DashboardCard>
  );
};

CustomerDetails.displayName = "CustomerDetails";
export default CustomerDetails;
