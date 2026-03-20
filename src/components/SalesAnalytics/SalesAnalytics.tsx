// ✅ 수정: 새로 만든 통계 쿼리 import (codegen이 생성한 훅 이름 확인 필요)
import { useGetSalesStatisticsQuery } from "@dashboard/graphql";
import { Box, Button, Select, Text } from "@saleor/macaw-ui-next";
import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// 차트 Props 인터페이스
interface ChartProps {
  data: any[];
  title: string;
  xAxisKey: string;
  yAxisKey: string;
  yAxisName: string;
  color?: string;
  onBarClick?: (data: any) => void;
}

const getXAxisTitle = (key: string): string => {
  switch (key) {
    case 'date':
      return '날짜';
    case 'productName':
      return '상품명';
    case 'variantName':
      return '옵션명';
    default:
      return key;
  }
};

// KST 날짜 객체 생성 헬퍼
const getKSTDateObj = (dateInput?: string | Date | number): Date => {
  const date = dateInput ? new Date(dateInput) : new Date();
  return new Date(date.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
};

// 공통 차트 컴포넌트 (하나로 통합)
const AnalyticsBarChart: React.FC<ChartProps> = ({
  data,
  title,
  xAxisKey,
  yAxisKey,
  yAxisName,
  color = "#135ee2",
  onBarClick
}) => {
  const currencyFormatter = (value: number) => new Intl.NumberFormat("ko-KR").format(value);

  const handleChartClick = (payload: any) => {
    if (onBarClick && payload && payload.activeLabel) {
      const clickedItem = data.find(item => item[xAxisKey] === payload.activeLabel);
      if (clickedItem) {
        onBarClick(clickedItem);
      }
    }
  };

  return (
    <>
      <Box width="100%" textAlign="center" marginBottom={6}>
        <Text size={6} fontWeight="bold">
          {title}
        </Text>
      </Box>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ bottom: 20 }} onClick={handleChartClick}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            interval={0}
            tickFormatter={(tick) => {
               // 날짜인 경우 MM-DD 포맷, 그 외(상품명 등)는 그대로
               if (xAxisKey === 'date') return String(tick).substring(5);
               // 이름이 너무 길면 자르기
               return String(tick).length > 10 ? String(tick).substring(0, 10) + "..." : tick;
            }}
          >
            <Label value={getXAxisTitle(xAxisKey)} offset={-15} position="insideBottom" />
          </XAxis>
          <YAxis tickFormatter={currencyFormatter} width={80} />
          <Tooltip 
            formatter={currencyFormatter} 
            labelFormatter={(label) => `${getXAxisTitle(xAxisKey)}: ${label}`}
          />
          <Bar 
            dataKey={yAxisKey} 
            fill={color} 
            name={yAxisName} 
            barSize={40} // 막대 두께 고정
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};


// --- Main SalesAnalytics Component ---

interface SalesAnalyticsProps {
  channelSlug?: string;
}

export const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ channelSlug }) => {
  const [dateRange, setDateRange] = useState<number>(30);

  // 시작 날짜 계산
  const startDate = useMemo(() => {
    const fromDateObj = getKSTDateObj();
    fromDateObj.setDate(fromDateObj.getDate() - dateRange);
    
    const year = fromDateObj.getFullYear();
    const month = String(fromDateObj.getMonth() + 1).padStart(2, "0");
    const day = String(fromDateObj.getDate()).padStart(2, "0");
    
    return `${year}-${month}-${day}`;
  }, [dateRange]);

  // ✅ 수정: 새로 만든 Query Hook 사용
  const { data, loading, error } = useGetSalesStatisticsQuery({
    variables: {
      channel: channelSlug!,
      createdAfter: startDate,
    },
    skip: !channelSlug,
    fetchPolicy: "network-only", // 항상 최신 데이터 조회
  });

  const { dailyStats, productStats, totalQuantity, totalAmount } = useMemo(() => {
    if (!data?.salesStatistics) {
      return { dailyStats: [], productStats: [], totalQuantity: 0, totalAmount: 0 };
    }

    const stats = data.salesStatistics;
    
    // 1. 날짜 채우기 로직 (데이터가 없는 날도 0으로 표시하기 위함)
    const dailyMap: Record<string, { quantity: number; amount: number }> = {};
    const todayKST = getKSTDateObj();

    for (let i = 0; i < dateRange; i++) {
      const date = new Date(todayKST);
      date.setDate(todayKST.getDate() - i);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}`;

      dailyMap[dateKey] = { quantity: 0, amount: 0 };
    }

    // 2. 서버 데이터 매핑
    stats.dailyStats.forEach((item) => {
      // item.date가 "YYYY-MM-DD" 형식이므로 바로 사용 가능
      if (dailyMap[item.date]) {
        dailyMap[item.date].quantity = item.totalQuantity;
        dailyMap[item.date].amount = item.totalAmount;
      }
    });

    // 3. 차트용 배열 변환 및 정렬
    const formattedDailyStats = Object.entries(dailyMap)
      .map(([date, val]) => ({
        date,
        quantity: val.quantity,
        amount: val.amount,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 4. 상품 통계 매핑 (Variant Name 포함 표시)
    const formattedProductStats = stats.productStats.map(item => ({
       // 🚨 수정: 상품명 빼고 옵션명만 표시
       // 만약 옵션명이 없으면(단일 상품 등) 상품명을 대신 표시하여 빈 값 방지
       name: item.variantName || item.productName, 
       quantity: item.quantity,
       amount: item.totalAmount
    }));

    return {
      dailyStats: formattedDailyStats,
      productStats: formattedProductStats,
      totalQuantity: stats.totalQuantity,
      totalAmount: stats.totalAmount,
    };
  }, [data, dateRange]);

  const cardStyles = {
    padding: 6,
    backgroundColor: "default1",
    borderColor: "default2",
    borderWidth: 1,
    borderRadius: 3,
    boxShadow: "defaultOverlay",
  } as const;

  const dateRangeOptions = [
    { label: "최근 7일", value: "7" },
    { label: "최근 15일", value: "15" },
    { label: "최근 30일", value: "30" },
  ];

  if (loading) return <Box {...cardStyles}><Text>판매 데이터 로딩 중...</Text></Box>;
  if (error) return <Box {...cardStyles}><Text>오류가 발생했습니다: {error.message}</Text></Box>;
  if (!channelSlug) return <Box {...cardStyles}><Text>채널을 선택하여 판매 데이터를 확인하세요.</Text></Box>;

  return (
    <Box {...cardStyles}>
      <Box
        display="flex"
        flexDirection="column"
        gap={6}
        width="100%"
      >
        {/* 상단: 합계 및 필터 */}
        <Box 
          display="flex" 
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          paddingBottom={4}
        >
          {/* 왼쪽: 총합 정보 */}
          <Box display="flex" gap={4} alignItems="baseline">
            <Text size={3} color="default2">총 판매 수량:</Text>
            <Text size={5} fontWeight="bold">
              {new Intl.NumberFormat("ko-KR").format(totalQuantity)}개
            </Text>
            <Text size={4} color="defaultDisabled">|</Text>
            <Text size={3} color="default2">총 판매 금액:</Text>
            <Text size={5} fontWeight="bold">
              {new Intl.NumberFormat("ko-KR").format(totalAmount)}원
            </Text>
          </Box>

          {/* 오른쪽: 기간 선택 */}
          <Box style={{ minWidth: 180 }}>
            <Select
              size="small"
              label="기간 선택"
              options={dateRangeOptions}
              value={String(dateRange)}
              onChange={(value) => setDateRange(Number(value))}
            />
          </Box>
        </Box>

        {/* 차트 1: 일별 판매 수량 */}
        <Box
          borderStyle="solid"
          borderWidth={1}
          borderColor="default1"
          borderRadius={3}
          padding={4}
        >
          <AnalyticsBarChart
            data={dailyStats}
            title={`최근 ${dateRange}일 판매 수량`}
            xAxisKey="date"
            yAxisKey="quantity"
            yAxisName="판매 수량"
            color="#6a2080"
          />
        </Box>

        {/* 차트 2: 일별 판매 금액 */}
        <Box
          borderStyle="solid"
          borderWidth={1}
          borderColor="default1"
          borderRadius={3}
          padding={4}
        >
          <AnalyticsBarChart
            data={dailyStats}
            title={`최근 ${dateRange}일 판매 금액`}
            xAxisKey="date"
            yAxisKey="amount"
            yAxisName="판매 금액"
            color="#135ee2"
          />
        </Box>

        {/* 차트 3: 상품별 판매 순위 (Top 50) */}
        <Box
          borderStyle="solid"
          borderWidth={1}
          borderColor="default1"
          borderRadius={3}
          padding={4}
        >
          <AnalyticsBarChart
            data={productStats}
            title={`기간 내 상품별 판매 순위 (Top 50)`}
            xAxisKey="name"
            yAxisKey="quantity"
            yAxisName="판매 수량"
            color="#008080"
          />
        </Box>
      </Box>
    </Box>
  );
};