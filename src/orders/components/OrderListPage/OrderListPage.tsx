// @ts-strict-ignore
import { TopNav } from "@dashboard/components/AppLayout/TopNav";
import { DashboardCard } from "@dashboard/components/Card";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import { ListPageLayout } from "@dashboard/components/Layouts";
import { OrderListQuery } from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import { sectionNames } from "@dashboard/intl";
import { OrderListUrlQueryParams, OrderListUrlSortField, orderUrl } from "@dashboard/orders/urls";
import { PageListProps, RelayToFlat, SortPage } from "@dashboard/types";
import {
  CircularProgress,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@saleor/macaw-ui";
import { stringify } from "qs";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory, useLocation } from "react-router";

import { OrderListDatagrid } from "../OrderListDatagrid";

const useStyles = makeStyles(
  theme => ({
    // 1. 기본 컨테이너: Flexbox, 그리고 여러 줄로 넘어가도록 설정 (핵심)
    filterContainer: {
      padding: theme.spacing(2, 3),
      display: "flex",
      flexWrap: "wrap", // ✅ 아이템이 많으면 다음 줄로 넘어가도록 설정
      alignItems: "flex-end", // ✅ 요소들의 하단을 기준으로 정렬
      gap: theme.spacing(2), // ✅ 요소들 사이의 간격
      borderBottom: `1px solid ${theme.palette.divider}`,
    },

    // 2. 각 필터 그룹의 스타일 (세로 정렬)
    filterGroup: {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(0.5),
    },

    // 3. 날짜 입력 필드를 담는 컨테이너
    dateInputs: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
    },

    // 4. 날짜 단축 버튼들을 담는 컨테이너
    dateQuickButtons: {
      display: "flex",
      gap: theme.spacing(1),
      marginTop: theme.spacing(1), // 날짜 입력창과의 상단 간격
    },

    // 5. 검색창 그룹 (공간을 차지하도록 설정)
    searchGroup: {
      display: "flex",
      flexGrow: 1, // ✅ 남는 공간을 최대한 차지
      gap: theme.spacing(2),
      minWidth: "450px", // ✅ 검색창들이 너무 작아지지 않도록 최소 너비 지정
    },

    // 6. 버튼 그룹 (항상 오른쪽 끝으로 보내기)
    buttonGroup: {
      marginLeft: "auto", // ✅ 이 한 줄이 버튼을 오른쪽 끝으로 보냅니다.
      display: "flex",
      gap: theme.spacing(1),
      paddingBottom: theme.spacing(1), // 다른 필터와의 높이 맞춤
    },

    // 7. 각 필터 요소의 기본 너비 (Select, Input 등)
    formControl: {
      minWidth: 180,
    },
  }),
  { name: "OrderListPage" },
);

interface Category {
  id: string;
  name: string;
}

export interface OrderListPageProps extends PageListProps, SortPage<OrderListUrlSortField> {
  orders: RelayToFlat<OrderListQuery["orders"]>;
  params: OrderListUrlQueryParams;
  onAdd: () => void;
  initialSearch: string;
  onSearchChange: (search: string) => void;
  onExport: () => void;
  exportLoading: boolean;
  categories: Category[];
  categoryLoading: boolean;
  pageTitle?: string;
  hideStatusFilter?: boolean;
  selectedOrderIds: string[];
  onSelectOrderIds: (rows: number[], clearSelection: () => void) => void;
  onClearSelection: () => void;
  onBulkAction: () => void;
  bulkActionProps?: {
    buttonTitle: string;
    confirmButtonState: ConfirmButtonTransitionState;
  };
}

const datePeriods = [
  { label: "오늘", value: "today" },
  { label: "어제", value: "yesterday" },
  { label: "3일", value: "3d" },
  { label: "7일", value: "7d" },
  { label: "15일", value: "15d" },
  { label: "1개월", value: "1m" },
  { label: "3개월", value: "3m" },
  { label: "6개월", value: "6m" },
];

const OrderListPage: React.FC<OrderListPageProps> = React.memo(
  ({
    params,
    onAdd,
    onExport,
    exportLoading,
    initialSearch,
    onSearchChange,
    categories,
    categoryLoading,
    pageTitle,
    hideStatusFilter,
    selectedOrderIds,
    onSelectOrderIds,
    onClearSelection,
    onBulkAction,
    bulkActionProps,
    ...listProps
  }) => {
    const classes = useStyles();
    const intl = useIntl();
    const history = useHistory();
    const location = useLocation();
    const navigate = useNavigator();

    // 필터 상태 관리
    const [dateRange, setDateRange] = useState({
      startDate: params.createdFrom || "",
      endDate: params.createdTo || "",
    });
    const [orderNumberQuery, setOrderNumberQuery] = useState(params.number || "");
    const [businessNameQuery, setBusinessNameQuery] = useState(initialSearch);

    const initialStatusParam = params.status || params.deliveryStatus;
    const [processingStatus, setProcessingStatus] = useState(
      // URL 파라미터가 배열일 경우 첫 번째 값만 사용하고, 아니면 그대로 사용합니다.
      Array.isArray(initialStatusParam) ? initialStatusParam[0] || "" : initialStatusParam || "",
    );

    const [paymentMethod, setPaymentMethod] = useState(params.paymentMethod || "");
    const [userType, setUserType] = useState(params.userType || "");
    const [category, setCategory] = useState(params.category || "");

    // URL 파라미터가 변경될 때 검색어 상태를 동기화
    useEffect(() => {
      setBusinessNameQuery(params.query || "");
    }, [params.query]);

    const getFormattedDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    // ✅ 날짜 단축 버튼 클릭 시 날짜를 설정하는 핸들러
    const handleDateQuickSelect = (period: string) => {
      const today = new Date();
      const startDate = new Date();
      const endDate = getFormattedDate(today);

      switch (period) {
        case "today":
          startDate.setDate(today.getDate());
          break;
        case "yesterday": {
          startDate.setDate(today.getDate() - 1);

          const yesterdayFormatted = getFormattedDate(startDate);

          setDateRange({ startDate: yesterdayFormatted, endDate: yesterdayFormatted });

          return;
        }
        case "3d":
          startDate.setDate(today.getDate() - 2);
          break;
        case "7d":
          startDate.setDate(today.getDate() - 6);
          break;
        case "15d":
          startDate.setDate(today.getDate() - 14);
          break;
        case "1m":
          startDate.setMonth(today.getMonth() - 1);
          break;
        case "3m":
          startDate.setMonth(today.getMonth() - 3);
          break;
        case "6m":
          startDate.setMonth(today.getMonth() - 6);
          break;
        default:
          break;
      }

      setDateRange({ startDate: getFormattedDate(startDate), endDate });
    };

    const handleFilterApply = () => {
      // onSearchChange를 호출하여 기존 검색 로직을 트리거합니다.
      onSearchChange(businessNameQuery);

      const orderStatusValues = ["UNFULFILLED", "COMPLETED"];
      const isOrderStatus = orderStatusValues.includes(processingStatus);

      const queryParams = {
        ...params,
        createdFrom: dateRange.startDate || undefined,
        createdTo: dateRange.endDate || undefined,
        query: businessNameQuery || undefined,
        number: orderNumberQuery || undefined,
        status: isOrderStatus ? processingStatus : undefined,
        deliveryStatus: !isOrderStatus ? processingStatus : undefined,
        paymentMethod: paymentMethod || undefined,
        category: category || undefined,
        userType: userType || undefined,
        after: undefined,
        before: undefined,
        asc: params.asc,
      };

      // boolean 타입은 stringify에서 문제가 될 수 있으므로, 수동으로 처리
      const { asc, ...restParams } = queryParams;
      const finalQueryString = stringify(restParams) + (asc !== undefined ? `&asc=${asc}` : "");

      history.push(`${location.pathname}?${finalQueryString}`);
    };

    const handleFilterReset = () => {
      setDateRange({ startDate: "", endDate: "" });
      setOrderNumberQuery("");
      setBusinessNameQuery("");
      setProcessingStatus("");
      setPaymentMethod("");
      setCategory("");
      setUserType("");
      onSearchChange(""); // 검색어 초기화

      const preservedParams = {
        sort: params.sort,
        asc: params.asc,
      };
      const finalQueryString = stringify(preservedParams, {
        // boolean 값을 올바르게 처리하기 위한 옵션
        encoder: (str, defaultEncoder, charset, type) =>
          type === "key" && str === "asc" ? str : defaultEncoder(str, defaultEncoder, charset),
      });

      history.push(`${location.pathname}?${finalQueryString}`);
    };

    const handleRowClick = (id: string) => {
      navigate(orderUrl(id), {
        state: {
          from: location.pathname + location.search,
        },
      });
    };

    return (
      <ListPageLayout>
        <TopNav title={pageTitle || intl.formatMessage(sectionNames.orders)}>
          <div style={{ display: "flex", gap: "8px" }}>
            {!!selectedOrderIds.length && bulkActionProps && (
              <Button
                variant="primary"
                onClick={onBulkAction}
                disabled={bulkActionProps.confirmButtonState === "loading"}
              >
                {bulkActionProps.confirmButtonState === "loading"
                  ? "처리 중..."
                  : `${selectedOrderIds.length}개 주문을 ${bulkActionProps.buttonTitle}`}
              </Button>
            )}
            <Button
              onClick={onExport}
              disabled={exportLoading}
              variant="secondary"
              data-test-id="export-orders-button"
            >
              {exportLoading ? "내보내는 중..." : "엑셀 다운로드"}
            </Button>
            {/* <Button data-test-id="create-order-button" onClick={onAdd}>
            주문 생성
          </Button> */}
          </div>
        </TopNav>

        <DashboardCard>
          <div className={classes.filterContainer}>
            {/* 날짜 필터 그룹 */}
            <div className={classes.filterGroup}>
              <InputLabel shrink>주문일</InputLabel>
              <div className={classes.dateInputs}>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.startDate}
                  onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
                <span>~</span>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.endDate}
                  onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className={classes.dateQuickButtons}>
                {datePeriods.map(({ label, value }) => (
                  <Button
                    key={value}
                    variant="secondary"
                    style={{ padding: "4px 8px", height: "auto", minWidth: "auto" }}
                    onClick={() => handleDateQuickSelect(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 검색 필터 그룹 */}
            <div className={classes.searchGroup}>
              <div className={classes.filterGroup} style={{ flex: 1 }}>
                <InputLabel shrink>주문번호</InputLabel>
                <Input
                  value={orderNumberQuery}
                  onChange={e => setOrderNumberQuery(e.target.value)}
                  placeholder="주문번호로 검색"
                  fullWidth
                />
              </div>
              <div className={classes.filterGroup} style={{ flex: 2 }}>
                <InputLabel shrink>통합 검색</InputLabel>
                <Input
                  value={businessNameQuery}
                  onChange={e => setBusinessNameQuery(e.target.value)}
                  placeholder="사업자명, 담당자명, 고객명 등"
                  fullWidth
                />
              </div>
            </div>

            {/* 선택 필터 그룹 */}
            {!hideStatusFilter && (
              <div className={classes.filterGroup}>
                <InputLabel shrink>주문 처리 상태</InputLabel>
                <FormControl variant="outlined" size="small" className={classes.formControl}>
                  <Select
                    value={processingStatus}
                    onChange={e => setProcessingStatus(e.target.value as string)}
                    displayEmpty
                    renderValue={selected => {
                      if (!selected) {
                        return "주문 처리 상태";
                      }

                      const options = {
                        UNFULFILLED: "미완료",
                        PREPARING: "배송 준비중",
                        IN_TRANSIT: "배송중",
                        DELIVERED: "배송 완료",
                        DELIVERY_FAILED: "배송 실패",
                        COMPLETED: "처리 완료",
                      };

                      return options[selected as keyof typeof options];
                    }}
                  >
                    <MenuItem value="">전체</MenuItem>
                    <MenuItem value="UNFULFILLED">미완료</MenuItem>
                    <MenuItem value="PREPARING">배송 준비중</MenuItem>
                    <MenuItem value="IN_TRANSIT">배송중</MenuItem>
                    <MenuItem value="DELIVERED">배송 완료</MenuItem>
                    <MenuItem value="DELIVERY_FAILED">배송 실패</MenuItem>
                    <MenuItem value="COMPLETED">처리 완료</MenuItem>
                  </Select>
                </FormControl>
              </div>
            )}
            <div className={classes.filterGroup}>
              <InputLabel shrink>고객 유형</InputLabel>
              <FormControl variant="outlined" size="small" className={classes.formControl}>
                <Select
                  value={userType}
                  onChange={e => setUserType(e.target.value as string)}
                  displayEmpty
                  renderValue={selected => {
                    if (!selected) {
                      return "고객 유형 선택";
                    }
                    // 값에 따라 표시될 텍스트를 매핑합니다.
                    const options = {
                      HOSPITAL: "병원",
                      AGENCY: "대리점",
                    };
                    return options[selected as keyof typeof options];
                  }}
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="HOSPITAL">병원</MenuItem>
                  <MenuItem value="AGENCY">대리점</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className={classes.filterGroup}>
              <InputLabel shrink>결제 방식</InputLabel>
              <FormControl variant="outlined" size="small" className={classes.formControl}>
                <Select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as string)}
                  displayEmpty
                  renderValue={selected => {
                    if (!selected) {
                      return "결제 방식 선택";
                    }

                    const options = {
                      card: "카드",
                      vbank: "가상계좌",
                      bank: "계좌이체",
                      other: "적립금/예치금",
                    };

                    return options[selected as keyof typeof options];
                  }}
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="card">카드</MenuItem>
                  <MenuItem value="vbank">가상계좌</MenuItem>
                  <MenuItem value="bank">계좌이체</MenuItem>
                  <MenuItem value="other">적립금/예치금</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className={classes.filterGroup}>
              <InputLabel shrink>카테고리</InputLabel>
              <FormControl variant="outlined" size="small" className={classes.formControl}>
                {categoryLoading ? (
                  <div style={{ display: "flex", alignItems: "center", height: "36px" }}>
                    <CircularProgress size={24} />
                  </div>
                ) : (
                  <Select
                    value={category}
                    onChange={e => setCategory(e.target.value as string)}
                    displayEmpty
                    renderValue={(selected: unknown): React.ReactNode => {
                      // ✅ 반환 타입 명시
                      if (!selected) {
                        return "카테고리 선택";
                      }

                      // selected가 string이라고 가정하고 처리
                      const selectedId = selected as string;
                      const selectedCategory = categories.find(cat => cat.id === selectedId);

                      return selectedCategory?.name || selectedId;
                    }}
                  >
                    <MenuItem value="">전체</MenuItem>
                    {categories?.map(cat => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </FormControl>
            </div>

            {/* 버튼 그룹 */}
            <div className={classes.buttonGroup}>
              <Button variant="secondary" onClick={handleFilterReset}>
                초기화
              </Button>
              <Button onClick={handleFilterApply} data-test-id="apply-filters-button">
                조회
              </Button>
            </div>
          </div>
          <OrderListDatagrid
            {...listProps}
            hasRowHover
            // rowAnchor={orderUrl}
            onRowClick={handleRowClick}
            onSelectOrderIds={onSelectOrderIds}
            showCheckboxes={hideStatusFilter}
          />
        </DashboardCard>
      </ListPageLayout>
    );
  },
);

OrderListPage.displayName = "OrderListPage";
export default OrderListPage;
