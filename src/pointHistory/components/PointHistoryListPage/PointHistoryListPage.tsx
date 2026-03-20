// @ts-strict-ignore
import { TopNav } from "@dashboard/components/AppLayout/TopNav";
import { DashboardCard } from "@dashboard/components/Card";
import { ListPageLayout } from "@dashboard/components/Layouts";
import { FormControl, Input, InputLabel, MenuItem, Select } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@saleor/macaw-ui";
import { stringify } from "qs";
import React, { useState } from "react";
import { useHistory, useLocation } from "react-router";

import { PointHistoryListDatagrid } from "../pointHistoryListDatagrid";


// OrderListPage와 동일한 스타일
const useStyles = makeStyles(
  theme => ({
    filterContainer: {
      padding: theme.spacing(2, 3),
      display: "flex",
      flexWrap: "wrap",
      alignItems: "flex-end",
      gap: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(0.5),
    },
    dateInputs: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    dateQuickButtons: {
      display: 'flex',
      gap: theme.spacing(1),
      marginTop: theme.spacing(1),
    },
    searchGroup: {
      display: 'flex',
      flexGrow: 1,
      gap: theme.spacing(2),
      minWidth: '300px',
    },
    buttonGroup: {
      marginLeft: "auto",
      display: "flex",
      gap: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
    formControl: {
      minWidth: 150,
    }
  }),
  { name: "PointHistoryListPage" },
);

const datePeriods = [
  { label: '오늘', value: 'today' },
  { label: '어제', value: 'yesterday' },
  { label: '3일', value: '3d' },
  { label: '7일', value: '7d' },
  { label: '1개월', value: '1m' },
];

export const PointHistoryListPage = ({
  data,
  disabled,
  settings,
  onUpdateListSettings,
  params,
  onExport,
  exportLoading,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();

  // 필터 상태 (URL 파라미터 기반 초기화)
  const [dateRange, setDateRange] = useState({
    startDate: params.createdFrom || "",
    endDate: params.createdTo || "",
  });
  const [searchQuery, setSearchQuery] = useState(params.query || "");
  const [transactionType, setTransactionType] = useState(params.transactionType || "");

  // 날짜 포맷 헬퍼
  const getFormattedDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 날짜 퀵 버튼 핸들러
  const handleDateQuickSelect = (period: string) => {
    const today = new Date();
    const startDate = new Date();
    const endDate = getFormattedDate(today);

    switch (period) {
      case 'today': break;
      case 'yesterday': startDate.setDate(today.getDate() - 1); break;
      case '3d': startDate.setDate(today.getDate() - 2); break;
      case '7d': startDate.setDate(today.getDate() - 6); break;
      case '1m': startDate.setMonth(today.getMonth() - 1); break;
      default: break;
    }
    
    // 어제의 경우 start=end
    if (period === 'yesterday') {
       const yesterday = getFormattedDate(startDate);
       setDateRange({ startDate: yesterday, endDate: yesterday });
    } else {
       setDateRange({ startDate: getFormattedDate(startDate), endDate });
    }
  };

  const handleFilterApply = () => {
    const queryParams = {
      ...params,
      createdFrom: dateRange.startDate || undefined,
      createdTo: dateRange.endDate || undefined,
      query: searchQuery || undefined,
      transactionType: transactionType || undefined,
      after: undefined, // 필터 변경 시 첫 페이지로
      before: undefined,
    };
    history.push(`${location.pathname}?${stringify(queryParams)}`);
  };

  const handleFilterReset = () => {
    setDateRange({ startDate: "", endDate: "" });
    setSearchQuery("");
    setTransactionType("");
    history.push(`${location.pathname}`);
  };

  return (
    <ListPageLayout>
      <TopNav title="전체 포인트 내역">
        <Button
          onClick={onExport}
          disabled={exportLoading}
          variant="secondary"
        >
          {exportLoading ? "생성 중..." : "엑셀 다운로드"}
        </Button>
      </TopNav>
      
      <DashboardCard>
        <div className={classes.filterContainer}>
          {/* 1. 날짜 필터 */}
          <div className={classes.filterGroup}>
            <InputLabel shrink>조회 기간</InputLabel>
            <div className={classes.dateInputs}>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
              <span>~</span>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div className={classes.dateQuickButtons}>
              {datePeriods.map(({ label, value }) => (
                <Button key={value} variant="secondary" onClick={() => handleDateQuickSelect(value)} style={{ padding: '4px 8px', height: 'auto' }}>
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* 2. 적립/사용 구분 */}
          <div className={classes.filterGroup}>
            <InputLabel shrink>구분</InputLabel>
            <FormControl variant="outlined" size="small" className={classes.formControl}>
              <Select
                value={transactionType}
                onChange={e => setTransactionType(e.target.value as string)}
                displayEmpty
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="CREDIT">적립</MenuItem>
                <MenuItem value="DEBIT">사용</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* 3. 검색 (병원명 등) */}
          <div className={classes.searchGroup}>
             <div className={classes.filterGroup} style={{ flex: 1 }}>
              <InputLabel shrink>검색</InputLabel>
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="병원명, 이메일, 사유 검색"
                fullWidth
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className={classes.buttonGroup}>
            <Button variant="secondary" onClick={handleFilterReset}>초기화</Button>
            <Button onClick={handleFilterApply}>조회</Button>
          </div>
        </div>

        <PointHistoryListDatagrid
          disabled={disabled}
          settings={settings}
          onUpdateListSettings={onUpdateListSettings}
          data={data}
        />
      </DashboardCard>
    </ListPageLayout>
  );
};