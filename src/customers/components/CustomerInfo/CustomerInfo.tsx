// src/customers/components/CustomerInfo/CustomerInfo.tsx (수정된 최종 코드)

// @ts-strict-ignore
import { DashboardCard } from "@dashboard/components/Card";
import Grid from "@dashboard/components/Grid";
import Hr from "@dashboard/components/Hr";
import { AccountErrorFragment, AddressFragment } from "@dashboard/graphql";
import { commonMessages } from "@dashboard/intl";
import { getFormErrors } from "@dashboard/utils/errors";
import getAccountErrorMessage from "@dashboard/utils/errors/account";
import { TextField } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";
import { Text } from "@saleor/macaw-ui-next";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

const useStyles = makeStyles(
  theme => ({
    content: {
      paddingTop: theme.spacing(2),
    },
    hr: {
      margin: theme.spacing(3, 0),
    },
    gridSpacer: {
      marginTop: theme.spacing(2), // 16px에 해당하는 theme spacing
    },
  }),
  { name: "CustomerInfo" },
);

// --- 1. Props 인터페이스에 새로운 B2B 필드 추가 ---
export interface CustomerInfoProps {
  data: {
    firstName: string;
    lastName: string;
    email: string;
    // B2B 필드
    businessName: string;
    representativeName: string;
    businessRegistrationNumber: string;
    businessPhone: string;
    departmentName: string;
    managerName: string;
    managerContact: string;
    businessAddress: AddressFragment | null;
  };
  disabled: boolean;
  errors: AccountErrorFragment[];
  onChange: (event: React.ChangeEvent<any>) => void;
}

const CustomerInfo: React.FC<CustomerInfoProps> = props => {
  const { data, disabled, errors, onChange } = props;

  const classes = useStyles(props);
  const intl = useIntl();

  // --- 2. getFormErrors에 새로운 필드 이름 추가 ---
  const formErrors = getFormErrors(
    [
      "firstName",
      "lastName",
      "email",
      "businessName",
      "representativeName",
      "businessRegistrationNumber",
      "businessPhone",
      "departmentName",
      "managerName",
      "managerContact",
      "businessAddress.streetAddress1",
      "businessAddress.streetAddress2",
      "businessAddress.postalCode",
    ],
    errors,
  );

  const businessAddress = data.businessAddress;

  return (
    <DashboardCard>
      <DashboardCard.Header>
        <DashboardCard.Title>
          {/* 헤더 제목을 '고객 정보'로 변경 */}
          <FormattedMessage id="zJ5Lz4" defaultMessage="고객 정보" description="header" />
        </DashboardCard.Title>
      </DashboardCard.Header>

      <DashboardCard.Content className={classes.content}>
        {/* --- 3. JSX에 새로운 섹션과 필드 추가 --- */}
        
        {/* 기존: 개인 정보 */}
        <Text>
          <FormattedMessage {...commonMessages.generalInformations} />
        </Text>
        <Grid variant="uniform">
          <TextField
            data-test-id="customer-first-name"
            disabled={disabled}
            error={!!formErrors.firstName}
            fullWidth
            helperText={getAccountErrorMessage(formErrors.firstName, intl)}
            name="firstName"
            label={intl.formatMessage(commonMessages.firstName)}
            value={data.firstName ?? ""}
            onChange={onChange}
          />
          <TextField
            data-test-id="customer-last-name"
            disabled={disabled}
            error={!!formErrors.lastName}
            fullWidth
            helperText={getAccountErrorMessage(formErrors.lastName, intl)}
            name="lastName"
            label={intl.formatMessage(commonMessages.lastName)}
            value={data.lastName ?? ""}
            onChange={onChange}
          />
        </Grid>
        <Grid variant="uniform" className={classes.gridSpacer}>
            <TextField
              data-test-id="customer-email"
              disabled={disabled}
              error={!!formErrors.email}
              fullWidth
              helperText={getAccountErrorMessage(formErrors.email, intl)}
              name="email"
              type="email"
              label={intl.formatMessage(commonMessages.email)}
              value={data.email}
              onChange={onChange}
            />
        </Grid>

        {/* 신규: 사업자 정보 */}
        <Hr className={classes.hr} />
        <Text>
          <FormattedMessage id="B5t6pA" defaultMessage="사업자 정보" description="section header" />
        </Text>
        <Grid variant="uniform">
          <TextField
            disabled={disabled}
            error={!!formErrors.businessName}
            fullWidth
            helperText={getAccountErrorMessage(formErrors.businessName, intl)}
            name="businessName"
            label="병원명 / 상호명"
            value={data.businessName ?? ""}
            onChange={onChange}
          />
          <TextField
            disabled={disabled}
            error={!!formErrors.representativeName}
            fullWidth
            helperText={getAccountErrorMessage(formErrors.representativeName, intl)}
            name="representativeName"
            label="대표 원장명"
            value={data.representativeName ?? ""}
            onChange={onChange}
          />
        </Grid>
        <Grid variant="uniform" className={classes.gridSpacer}>
          <TextField
            disabled={disabled}
            error={!!formErrors.businessRegistrationNumber}
            fullWidth
            helperText={getAccountErrorMessage(formErrors.businessRegistrationNumber, intl)}
            name="businessRegistrationNumber"
            label="사업자 번호"
            value={data.businessRegistrationNumber ?? ""}
            onChange={onChange}
          />
          <TextField
            disabled={disabled}
            error={!!formErrors.businessPhone}
            fullWidth
            helperText={getAccountErrorMessage(formErrors.businessPhone, intl)}
            name="businessPhone"
            label="병원 전화번호"
            value={data.businessPhone ?? ""}
            onChange={onChange}
          />
        </Grid>

        {/* 신규: 담당자 정보 */}
        <Hr className={classes.hr} />
        <Text>
          <FormattedMessage id="Fm4u6J" defaultMessage="담당자 정보" description="section header" />
        </Text>
        <Grid variant="uniform">
          <TextField
            disabled={disabled}
            error={!!formErrors.managerName}
            fullWidth
            helperText={getAccountErrorMessage(formErrors.managerName, intl)}
            name="managerName"
            label="담당자 성명"
            value={data.managerName ?? ""}
            onChange={onChange}
          />
          <TextField
            disabled={disabled}
            error={!!formErrors.managerContact}
            fullWidth
            helperText={getAccountErrorMessage(formErrors.managerContact, intl)}
            name="managerContact"
            label="담당자 연락처"
            value={data.managerContact ?? ""}
            onChange={onChange}
          />
        </Grid>
        <Grid variant="uniform" className={classes.gridSpacer}>
            <TextField
              disabled={disabled}
              error={!!formErrors.departmentName}
              fullWidth
              helperText={getAccountErrorMessage(formErrors.departmentName, intl)}
              name="departmentName"
              label="담당 부서명"
              value={data.departmentName ?? ""}
              onChange={onChange}
            />
        </Grid>
        <Hr className={classes.hr} />
      <Text>
        <FormattedMessage id="businessAddress" defaultMessage="사업장 주소" description="section header" />
      </Text>
      <Grid variant="uniform" className={classes.gridSpacer}>
        <TextField
          disabled={disabled}
          error={!!formErrors["businessAddress.postalCode"]}
          fullWidth
          helperText={getAccountErrorMessage(formErrors["businessAddress.postalCode"], intl)}
          name="businessAddress.postalCode" // name을 중첩된 형태로 지정
          label="우편번호"
          value={businessAddress?.postalCode ?? ""}
          onChange={onChange}
        />
      </Grid>
      <Grid variant="uniform" className={classes.gridSpacer}>
        <TextField
          disabled={disabled}
          error={!!formErrors["businessAddress.streetAddress1"]}
          fullWidth
          helperText={getAccountErrorMessage(formErrors["businessAddress.streetAddress1"], intl)}
          name="businessAddress.streetAddress1"
          label="기본 주소"
          value={businessAddress?.streetAddress1 ?? ""}
          onChange={onChange}
        />
      </Grid>
      <Grid variant="uniform" className={classes.gridSpacer}>
        <TextField
          disabled={disabled}
          error={!!formErrors["businessAddress.streetAddress2"]}
          fullWidth
          helperText={getAccountErrorMessage(formErrors["businessAddress.streetAddress2"], intl)}
          name="businessAddress.streetAddress2"
          label="상세 주소"
          value={businessAddress?.streetAddress2 ?? ""}
          onChange={onChange}
        />
      </Grid>
      <Hr className={classes.hr} />
      </DashboardCard.Content>
    </DashboardCard>
  );
};

CustomerInfo.displayName = "CustomerInfo";
export default CustomerInfo;