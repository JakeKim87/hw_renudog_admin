// @ts-strict-ignore
import { MutationResult } from "@apollo/client";
import { AppWidgets } from "@dashboard/apps/components/AppWidgets/AppWidgets";
import { TopNav } from "@dashboard/components/AppLayout/TopNav";
import { Backlink } from "@dashboard/components/Backlink";
import { CardSpacer } from "@dashboard/components/CardSpacer";
import { ConfirmButton, ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import Form from "@dashboard/components/Form";
import { DetailPageLayout } from "@dashboard/components/Layouts";
import { Metadata } from "@dashboard/components/Metadata/Metadata";
import { MetadataFormData } from "@dashboard/components/Metadata/types";
import RequirePermissions from "@dashboard/components/RequirePermissions";
import { Savebar } from "@dashboard/components/Savebar";
import { customerAddressesUrl, customerListPath } from "@dashboard/customers/urls";
import { extensionMountPoints } from "@dashboard/extensions/extensionMountPoints";
import { getExtensionsItemsForCustomerDetails } from "@dashboard/extensions/getExtensionsItems";
import { useExtensions } from "@dashboard/extensions/hooks/useExtensions";
import {
  AccountErrorFragment,
  AddressFragment,
  CustomerDepositHistoryQuery,
  CustomerDetailsQuery,
  CustomerPointHistoryQuery,
  DepositManageMutationResult,
  ExchangeCancellationBulkCreateMutationResult,
  LegacyOrderBulkCreateMutationResult,
  MembershipTierFragment,
  PermissionEnum,
  PointManageMutationResult,
  SalesRepresentativeFragment,
  UpdateCustomerEmailByStaffMutationResult,
  UserMembershipUpdateMutationResult,
} from "@dashboard/graphql";
import { useBackLinkWithState } from "@dashboard/hooks/useBackLinkWithState";
import { SubmitPromise } from "@dashboard/hooks/useForm";
import useNavigator from "@dashboard/hooks/useNavigator";
import { sectionNames } from "@dashboard/intl";
import { orderListUrl } from "@dashboard/orders/urls";
import { mapEdgesToItems, mapMetadataItemToInput } from "@dashboard/utils/maps";
import useMetadataChangeTrigger from "@dashboard/utils/metadata/useMetadataChangeTrigger";
// --- ADDED START ---
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useRef, useState } from "react";
// --- ADDED END ---
import { useIntl } from "react-intl";

import { getUserName } from "../../../misc";
import CustomerAddresses from "../CustomerAddresses";
import CustomerDepositHistoryCard from "../CustomerDepositHistoryCard/CustomerDepositHistoryCard";
import CustomerDetails from "../CustomerDetails";
import CustomerInfo from "../CustomerInfo";
import CustomerOrders from "../CustomerOrders";
import CustomerPointHistoryCard from "../CustomerPointHistoryCard/CustomerPointHistoryCard";
import CustomerStats from "../CustomerStats";

interface CustomerLegacyOrderCardProps {
  onUpload: (file: File) => void;
  uploadOpts: LegacyOrderBulkCreateMutationResult;
}

const CustomerLegacyOrderCard: React.FC<CustomerLegacyOrderCardProps> = ({
  onUpload,
  uploadOpts,
}) => {
  const intl = useIntl();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadState: ConfirmButtonTransitionState = uploadOpts.loading ? "loading" : "default";

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
      event.target.value = "";
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader
        title={intl.formatMessage({
          id: "legacy_order_upload_title",
          defaultMessage: "과거 주문 내역 업로드",
        })}
      />
      <CardContent>
        <Typography variant="body2">
          {intl.formatMessage({
            id: "legacy_order_upload_desc",
            defaultMessage: "엑셀 파일을 업로드하여 과거 주문 내역을 일괄 등록합니다.",
          })}
        </Typography>
        <CardSpacer />
        <input
          type="file"
          ref={inputRef}
          style={{ display: "none" }}
          accept=".xlsx, .xls"
          onChange={handleFileChange}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleButtonClick}
          disabled={uploadState === "loading"}
          data-test-id="upload-legacy-order-button"
        >
          {uploadState === "loading"
            ? intl.formatMessage({ id: "uploading", defaultMessage: "업로드 중..." })
            : intl.formatMessage({
                id: "excel_file_upload",
                defaultMessage: "엑셀 파일 업로드",
              })}
        </Button>
      </CardContent>
    </Card>
  );
};

interface CustomerExchangeCancellationCardProps {
  onUpload: (file: File) => void;
  uploadOpts: ExchangeCancellationBulkCreateMutationResult;
}

const CustomerExchangeCancellationCard: React.FC<CustomerExchangeCancellationCardProps> = ({
  onUpload,
  uploadOpts,
}) => {
  const intl = useIntl();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadState: ConfirmButtonTransitionState = uploadOpts.loading ? "loading" : "default";

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
      // 같은 파일을 다시 업로드할 수 있도록 input 값을 초기화합니다.
      event.target.value = "";
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader
        title={intl.formatMessage({
          id: "exchange_cancellation_upload_title",
          defaultMessage: "교환/취소 내역 업로드",
        })}
      />
      <CardContent>
        <Typography variant="body2">
          {intl.formatMessage({
            id: "exchange_cancellation_upload_desc",
            defaultMessage:
              "엑셀 파일을 업로드하여 교환 또는 취소 내역을 일괄 등록합니다.",
          })}
        </Typography>
        <CardSpacer />
        {/* 숨겨진 파일 입력 필드 */}
        <input
          type="file"
          ref={inputRef}
          style={{ display: "none" }}
          accept=".xlsx, .xls"
          onChange={handleFileChange}
        />
        {/* 사용자가 클릭할 버튼 */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleButtonClick}
          disabled={uploadState === "loading"}
          data-test-id="upload-excel-button"
        >
          {uploadState === "loading"
            ? intl.formatMessage({ id: "uploading", defaultMessage: "업로드 중..." })
            : intl.formatMessage({ id: "excel_file_upload", defaultMessage: "엑셀 파일 업로드" })}
        </Button>
      </CardContent>
    </Card>
  );
};


// --- ADDED START ---
interface BalanceManageDialogProps {
  open: boolean;
  title: string;
  amountLabel: string;
  confirmButtonState: ConfirmButtonTransitionState;
  onClose: () => void;
  onConfirm: (data: { amount: number; reason: string }) => void;
}

const BalanceManageDialog: React.FC<BalanceManageDialogProps> = ({
  open,
  title,
  amountLabel,
  confirmButtonState,
  onClose,
  onConfirm,
}) => {
  const intl = useIntl();
  const [amount, setAmount] = useState<number | string>("");
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setAmount("");
    setReason("");
    onClose();
  };

  const handleConfirm = () => {
    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    
    if (!isNaN(numericAmount)) {
      onConfirm({ amount: numericAmount, reason });
      handleClose();
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    if (/^-?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField name="amount" label={amountLabel} type="tel" value={amount} onChange={handleAmountChange} fullWidth autoFocus />
        <CardSpacer />
        <TextField name="reason" label={intl.formatMessage({ id: "reason", defaultMessage: "사유" })} value={reason} onChange={e => setReason(e.target.value)} fullWidth multiline />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">취소</Button>
        <ConfirmButton transitionState={confirmButtonState} onClick={handleConfirm}>확인</ConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

interface CustomerWalletProps {
  customer: CustomerDetailsQuery["user"];
  pointManageOpts: PointManageMutationResult;
  depositManageOpts: DepositManageMutationResult;
  onPointManage: (data: PointData) => void;
  onDepositManage: (data: DepositData) => void;
}

const CustomerWallet: React.FC<CustomerWalletProps> = ({
  customer,
  onPointManage,
  onDepositManage,
  pointManageOpts,
  depositManageOpts,
}) => {
  const intl = useIntl();
  const [dialog, setDialog] = useState<"none" | "point" | "deposit">("none");

  const pointBalance = customer?.pointWallet?.balance ?? 0;
  const depositBalance = customer?.depositWallet?.balance ?? 0;
  const pointConfirmState: ConfirmButtonTransitionState = pointManageOpts.loading ? "loading" : "default";
  const depositConfirmState: ConfirmButtonTransitionState = depositManageOpts.loading ? "loading" : "default";

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6">{intl.formatMessage({ id: "walletManagement", defaultMessage: "지갑 관리" })}</Typography>
          <CardSpacer />
          <Typography>{intl.formatMessage({ id: "pointsBalance", defaultMessage: "포인트 잔액:" })} {pointBalance.toLocaleString()} P</Typography>
          <Button color="primary" onClick={() => setDialog("point")}>{intl.formatMessage({ id: "managePoints", defaultMessage: "포인트 관리" })}</Button>
          <CardSpacer />
          <Typography>{intl.formatMessage({ id: "depositsBalance", defaultMessage: "예치금 잔액:" })} {depositBalance.toLocaleString()} 원</Typography>
          <Button color="primary" onClick={() => setDialog("deposit")}>{intl.formatMessage({ id: "manageDeposits", defaultMessage: "예치금 관리" })}</Button>
        </CardContent>
      </Card>
      <BalanceManageDialog
        open={dialog === "point"}
        onClose={() => setDialog("none")}
        title={intl.formatMessage({ id: "managePoints", defaultMessage: "포인트 관리" })}
        amountLabel={intl.formatMessage({ id: "pointsAmount", defaultMessage: "포인트 (차감은 음수로 입력)" })}
        confirmButtonState={pointConfirmState}
        onConfirm={({ amount, reason }) => onPointManage({ points: amount, reason })}
      />
      <BalanceManageDialog
        open={dialog === "deposit"}
        onClose={() => setDialog("none")}
        title={intl.formatMessage({ id: "manageDeposits", defaultMessage: "예치금 관리" })}
        amountLabel={intl.formatMessage({ id: "depositsAmount", defaultMessage: "예치금 (차감은 음수로 입력)" })}
        confirmButtonState={depositConfirmState}
        onConfirm={({ amount, reason }) => onDepositManage({ amount, reason })}
      />
    </>
  );
};
// --- ADDED END ---

export interface CustomerDetailsPageFormData extends MetadataFormData {
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  note: string;
  businessName: string;
  representativeName: string;
  businessRegistrationNumber: string;
  businessPhone: string;
  businessAddress: AddressFragment | null;
  departmentName: string;
  managerName: string;
  managerContact: string;
  salesRepresentative: string; 
}

// --- ADDED START ---
export interface PointData {
  points: number;
  reason: string;
}
export interface DepositData {
  amount: number;
  reason: string;
}
// --- ADDED END ---

export interface CustomerDetailsPageProps {
  customerId: string;
  customer: CustomerDetailsQuery["user"];
  disabled: boolean;
  errors: AccountErrorFragment[];
  saveButtonBar: ConfirmButtonTransitionState;
  onSubmit: (data: CustomerDetailsPageFormData) => SubmitPromise<AccountErrorFragment[]>;
  onDelete: () => void;
  pointManageOpts: PointManageMutationResult;
  depositManageOpts: DepositManageMutationResult;
  onPointManage: (data: PointData) => void;
  onDepositManage: (data: DepositData) => void;
  depositHistoryData: CustomerDepositHistoryQuery["user"];
  depositHistoryLoading: boolean;
  pointHistoryData: CustomerPointHistoryQuery["user"];
  pointHistoryLoading: boolean;
  onDepositCancel: (historyId: string) => void;
  depositCancelOpts: MutationResult;
  tiers: MembershipTierFragment[];
  onTierChange: (tierId: string | null) => void;
  updateMembershipOpts: UserMembershipUpdateMutationResult;
  reps: SalesRepresentativeFragment[];
  onExchangeCancellationUpload: (file: File) => void;
  exchangeCancellationUploadOpts: ExchangeCancellationBulkCreateMutationResult;
  onLegacyOrderUpload: (file: File) => void;
  legacyOrderUploadOpts: LegacyOrderBulkCreateMutationResult;
  onEmailUpdate: (email: string) => Promise<any>;
  updateEmailOpts: UpdateCustomerEmailByStaffMutationResult;
}

const CustomerDetailsPage: React.FC<CustomerDetailsPageProps> = ({
  customerId,
  customer,
  disabled,
  errors,
  saveButtonBar,
  onSubmit,
  onDelete,
  pointManageOpts,
  depositManageOpts,
  onPointManage,
  onDepositManage,
  depositHistoryData,
  depositHistoryLoading,
  pointHistoryData,
  pointHistoryLoading,
  onDepositCancel,
  depositCancelOpts,
  tiers,
  onTierChange,
  updateMembershipOpts,
  reps,
  onExchangeCancellationUpload,
  exchangeCancellationUploadOpts,
  onLegacyOrderUpload,
  legacyOrderUploadOpts,
  onEmailUpdate,
  updateEmailOpts,
}: CustomerDetailsPageProps) => {
  const intl = useIntl();
  const navigate = useNavigator();
  const initialForm: CustomerDetailsPageFormData = {
    email: customer?.email || "",
    firstName: customer?.firstName || "",
    isActive: customer?.isActive || false,
    lastName: customer?.lastName || "",
    metadata: customer?.metadata.map(mapMetadataItemToInput),
    note: customer?.note || "",
    privateMetadata: customer?.privateMetadata
      ? customer?.privateMetadata.map(mapMetadataItemToInput)
      : [],
    businessName: customer?.businessName || "",
    representativeName: customer?.representativeName || "",
    businessRegistrationNumber: customer?.businessRegistrationNumber || "",
    businessPhone: customer?.businessPhone || "",
    businessAddress: customer?.businessAddress || null,
    departmentName: customer?.departmentName || "",
    managerName: customer?.managerName || "",
    managerContact: customer?.managerContact || "",
    salesRepresentative: customer?.salesRepresentative?.id || "",
  };
  const { makeChangeHandler: makeMetadataChangeHandler } = useMetadataChangeTrigger();
  const { CUSTOMER_DETAILS_MORE_ACTIONS, CUSTOMER_DETAILS_WIDGETS } = useExtensions(
    extensionMountPoints.CUSTOMER_DETAILS,
  );
  const extensionMenuItems = getExtensionsItemsForCustomerDetails(
    CUSTOMER_DETAILS_MORE_ACTIONS,
    customerId,
  );

  const customerBackLink = useBackLinkWithState({
    path: customerListPath,
  });

  const currentTierId = customer?.membership?.tier?.id || "";

  return (
    <Form confirmLeave initial={initialForm} onSubmit={onSubmit} disabled={disabled}>
      {({ change, data, isSaveDisabled, submit }) => {
        const changeMetadata = makeMetadataChangeHandler(change);
        
        return (
          <DetailPageLayout>
            <TopNav href={customerBackLink} title={getUserName(customer, true)}>
              {extensionMenuItems.length > 0 && (
                <TopNav.Menu items={[...extensionMenuItems]} dataTestId="menu" />
              )}
            </TopNav>
            <DetailPageLayout.Content>
              <Backlink href={customerBackLink}>
                {intl.formatMessage(sectionNames.customers)}
              </Backlink>
              <CustomerDetails
                customer={customer}
                data={data}
                disabled={disabled}
                errors={errors}
                onChange={change}
                onEmailUpdate={onEmailUpdate}
                updateEmailOpts={updateEmailOpts}
              />
              <CardSpacer />
              <CustomerInfo data={data} disabled={disabled} errors={errors} onChange={change} />
              <CardSpacer />
              {/* <Card>
                <CardHeader
                  title={"회원 등급 관리"}
                />
                <CardContent>
                  <TextField
                    select
                    fullWidth
                    // 전체 폼이 비활성화되었거나, 등급 업데이트 중일 때 비활성화
                    disabled={disabled || updateMembershipOpts.loading}
                    value={currentTierId}
                    onChange={e => onTierChange(e.target.value || null)}
                    label={"할당된 회원 등급"}
                    name="membershipTier"
                    data-test-id="membership-tier-select"
                  >
                    <MenuItem value="">
                      <em>
                        등급 없음
                      </em>
                    </MenuItem>
                    {tiers.map(tier => (
                      <MenuItem key={tier.id} value={tier.id}>
                        {tier.grade}
                      </MenuItem>
                    ))}
                  </TextField>
                </CardContent>
              </Card> */}
              <Card>
                <CardHeader title={"담당자 관리"} />
                <CardContent>
                  <TextField
                    select
                    fullWidth
                    // <<< 3. disabled prop 하나로 모든 비활성화 상태를 제어합니다. >>>
                    // CustomerDetailsViewInner에서 이미 updateCustomerOpts.loading을
                    // disabled prop에 포함시켜서 전달하고 있습니다.
                    disabled={disabled}
                    value={data.salesRepresentative}
                    onChange={change}
                    label={"할당된 담당자"}
                    name="salesRepresentative"
                    data-test-id="sales-rep-select"
                  >
                    <MenuItem value="">
                      <em>담당자 없음</em>
                    </MenuItem>
                    {reps.map(rep => (
                      <MenuItem key={rep.id} value={rep.id}>
                        {rep.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </CardContent>
              </Card>
              <RequirePermissions requiredPermissions={[PermissionEnum.MANAGE_ORDERS]}>
                <CustomerOrders
                  orders={mapEdgesToItems(customer?.orders)}
                  viewAllHref={orderListUrl({
                    query: customer?.businessName || customer?.email,
                  })}
                />
                <CardSpacer />
              </RequirePermissions>
              <CardSpacer />
              {/* <Metadata data={data} onChange={changeMetadata} /> */}
              {/* <CardSpacer /> */}
              <RequirePermissions requiredPermissions={[PermissionEnum.MANAGE_USERS]}>
                <CustomerPointHistoryCard
                  pointData={pointHistoryData}
                  pointHistoryLoading={pointHistoryLoading}
                />
                <CardSpacer />
                <CustomerDepositHistoryCard
                  depositData={depositHistoryData}
                  depositHistoryLoading={depositHistoryLoading}
                  onDepositCancel={onDepositCancel}
                  depositCancelOpts={depositCancelOpts}
                />
              </RequirePermissions>
            </DetailPageLayout.Content>
            <DetailPageLayout.RightSidebar>
              <RequirePermissions requiredPermissions={[PermissionEnum.MANAGE_ORDERS]}>
                <CustomerExchangeCancellationCard
                  onUpload={onExchangeCancellationUpload}
                  uploadOpts={exchangeCancellationUploadOpts}
                />
                <CardSpacer />
                <CustomerLegacyOrderCard
                  onUpload={onLegacyOrderUpload}
                  uploadOpts={legacyOrderUploadOpts}
                />
                <CardSpacer />
              </RequirePermissions>
              <CustomerAddresses
                customer={customer}
                disabled={disabled}
                manageAddressHref={customerAddressesUrl(customerId)}
              />
              <CardSpacer />
              <CustomerStats customer={customer} />
              <CardSpacer />
              {/* --- ADDED START --- */}
              <RequirePermissions requiredPermissions={[PermissionEnum.MANAGE_USERS]}>
                <CustomerWallet
                  customer={customer}
                  onPointManage={onPointManage}
                  onDepositManage={onDepositManage}
                  pointManageOpts={pointManageOpts}
                  depositManageOpts={depositManageOpts}
                />
                <CardSpacer />
              </RequirePermissions>
              {/* --- ADDED END --- */}
              {/* <RequirePermissions requiredPermissions={[PermissionEnum.MANAGE_GIFT_CARD]}>
                <CustomerGiftCardsCard />
              </RequirePermissions> */}
              {CUSTOMER_DETAILS_WIDGETS.length > 0 && customer?.id && (
                <>
                  <CardSpacer />
                  <Divider />
                  <AppWidgets
                    extensions={CUSTOMER_DETAILS_WIDGETS}
                    params={{ customerId: customer.id }}
                  />
                </>
              )}
            </DetailPageLayout.RightSidebar>
            <Savebar>
              <Savebar.DeleteButton onClick={onDelete} />
              <Savebar.Spacer />
              <Savebar.CancelButton onClick={() => navigate(customerBackLink)} />
              <Savebar.ConfirmButton
                transitionState={saveButtonBar}
                onClick={submit}
                disabled={isSaveDisabled}
              />
            </Savebar>
          </DetailPageLayout>
        );
      }}
    </Form>
  );
};

CustomerDetailsPage.displayName = "CustomerDetailsPage";
export default CustomerDetailsPage;