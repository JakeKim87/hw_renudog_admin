// @ts-strict-ignore
import { TopNav } from "@dashboard/components/AppLayout/TopNav";
import { BulkDeleteButton } from "@dashboard/components/BulkDeleteButton";
import { DashboardCard } from "@dashboard/components/Card";
import { Customers } from "@dashboard/customers/types";
import { customerAddUrl, CustomerListUrlQueryParams, CustomerListUrlSortField, customerUrl } from "@dashboard/customers/urls";
import { MembershipTierFragment } from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import { sectionNames } from "@dashboard/intl";
import { PageListProps, SortPage } from "@dashboard/types";
import { FormControl, Input, InputLabel, MenuItem, Select } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Button } from "@saleor/macaw-ui-next";
import { stringify } from "qs";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory, useLocation } from "react-router";

import { CustomerListDatagrid } from "../CustomerListDatagrid/CustomerListDatagrid";

// 주문 페이지와 동일한 스타일을 가져옵니다.
const useStyles = makeStyles(
  theme => ({
    filterContainer: {
      padding: theme.spacing(2, 3),
      display: "flex",
      alignItems: "flex-end",
      gap: theme.spacing(2),
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(0.5),
    },
    buttonGroup: {
      marginLeft: "auto",
      display: "flex",
      gap: theme.spacing(1),
    },
    formControl: {
      minWidth: 180,
    },
    topNavButtons: {
        display: "flex",
        gap: theme.spacing(1),
    },
  }),
  { name: "CustomerListPage" },
);

// Props에서 복잡한 필터 관련 타입을 모두 제거합니다.
export interface CustomerListPageProps
  extends PageListProps,
    SortPage<CustomerListUrlSortField> {
  customers: Customers | undefined;
  params: CustomerListUrlQueryParams;
  selectedCustomerIds: string[];
  membershipTiers: MembershipTierFragment[] | undefined;
  loading: boolean;
  onSelectCustomerIds: (rows: number[], clearSelection: () => void) => void;
  onCustomersDelete: () => void;
  onExport: () => void;
  exportLoading: boolean;
}

const CustomerListPage: React.FC<CustomerListPageProps> = ({
  params,
  selectedCustomerIds,
  membershipTiers,
  onCustomersDelete,
  onExport,
  exportLoading,
  ...listProps
}) => {
  const classes = useStyles();
  const intl = useIntl();
  const navigate = useNavigator();
  const history = useHistory();
  const location = useLocation();

  // URL 파라미터 값으로 필터 UI의 초기 상태를 설정합니다.
  const [searchQuery, setSearchQuery] = React.useState(params.query || "");
  const [isActive, setIsActive] = React.useState(params.isActive || "");
  const [selectedTier, setSelectedTier] = React.useState(params.membershipTier || "");

  // '조회' 버튼 클릭 시 URL을 변경하여 페이지를 리로드합니다.
  const handleFilterApply = () => {
    const queryParams = {
      ...params,
      query: searchQuery || undefined,
      isActive: isActive || undefined,
      membershipTier: selectedTier || undefined,
      before: undefined, // 페이지네이션 리셋
      after: undefined,
    };

    history.push(`${location.pathname}?${stringify(queryParams)}`);
  };

  // '초기화' 버튼 클릭 시 필터 관련 URL 파라미터를 모두 제거합니다.
  const handleFilterReset = () => {
    setSearchQuery("");
    setIsActive("");

    const preservedParams = { sort: params.sort, asc: params.asc };

    history.push(`${location.pathname}?${stringify(preservedParams)}`);
  };

  return (
    <>
      <TopNav title={intl.formatMessage(sectionNames.customers)}>
        <div className={classes.topNavButtons}>
            {/* 엑셀 다운로드 버튼 추가 */}
            <Button 
                onClick={onExport} 
                disabled={exportLoading || listProps.loading} 
                variant="secondary"
            >
                {exportLoading ? "생성 중..." : "엑셀 다운로드"}
            </Button>
            <Button data-test-id="create-customer" onClick={() => navigate(customerAddUrl)}>
            <FormattedMessage id="QLVddq" defaultMessage="Create customer" description="button" />
            </Button>
        </div>
      </TopNav>
      
      <DashboardCard>
        <div className={classes.filterContainer}>
          {/* 통합 검색 */}
          <div className={classes.filterGroup} style={{ flex: 1 }}>
            <InputLabel shrink>고객 검색</InputLabel>
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="고객명, 이메일, 병원명 등"
              fullWidth
            />
          </div>

          {/* 활성화 여부 필터 */}
          <div className={classes.filterGroup}>
            <InputLabel shrink>활성화 여부</InputLabel>
            <FormControl variant="outlined" size="small" className={classes.formControl}>
              <Select
                value={isActive}
                onChange={e => setIsActive(e.target.value as string)}
                displayEmpty
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="true">활성</MenuItem>
                <MenuItem value="false">비활성</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className={classes.filterGroup}>
            <InputLabel shrink>회원 등급</InputLabel>
            <FormControl variant="outlined" size="small" className={classes.formControl}>
              <Select
                value={selectedTier}
                onChange={e => setSelectedTier(e.target.value as string)}
                displayEmpty
                disabled={listProps.loading} // 로딩 중 비활성화
              >
                <MenuItem value="">전체</MenuItem>
                {membershipTiers?.map(tier => (
                  <MenuItem key={tier.id} value={tier.id}>
                    {tier.grade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          {/* 버튼 그룹 */}
          <div className={classes.buttonGroup}>
            <Button variant="secondary" onClick={handleFilterReset}>
              초기화
            </Button>
            <Button onClick={handleFilterApply}>
              조회
            </Button>
          </div>
        </div>

        {selectedCustomerIds.length > 0 && (
          <Box paddingX={6} paddingY={4}>
            <BulkDeleteButton onClick={onCustomersDelete}>
              <FormattedMessage defaultMessage="Delete customers" id="kFsTMN" />
            </BulkDeleteButton>
          </Box>
        )}

        <CustomerListDatagrid
          {...listProps}
          hasRowHover
          rowAnchor={customerUrl}
          onRowClick={id => navigate(customerUrl(id))}
        />
      </DashboardCard>
    </>
  );
};

CustomerListPage.displayName = "CustomerListPage";
export default CustomerListPage;