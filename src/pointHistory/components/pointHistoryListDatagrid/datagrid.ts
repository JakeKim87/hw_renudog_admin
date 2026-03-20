// @ts-strict-ignore
import {
  dateCell,
  pillCell,
  readonlyTextCell,
} from "@dashboard/components/Datagrid/customCells/cells";
import { GetCellContentOpts } from "@dashboard/components/Datagrid/Datagrid";
import { AvailableColumn } from "@dashboard/components/Datagrid/types";
import { getStatusColor } from "@dashboard/misc";
import { GridCell, Item } from "@glideapps/glide-data-grid";
import { useTheme } from "@saleor/macaw-ui-next";

// 컬럼 정의
export const pointHistoryStaticColumns = [
  {
    id: "date",
    title: "일시",
    width: 200,
  },
  {
    id: "hospital",
    title: "병원명",
    width: 250,
  },
  {
    id: "type",
    title: "구분",
    width: 100,
  },
  {
    id: "points",
    title: "포인트",
    width: 150,
  },
  {
    id: "balanceAfterTransaction",
    title: "잔액",
    width: 150,
  },
  {
    id: "reason",
    title: "사유",
    width: 1000,
  },
];

interface PointHistoryNode {
  id: string;
  createdAt: string;
  points: number;
  balanceAfterTransaction: number;
  reason: string;
  user?: {
    email: string;
    businessName?: string; // 키값 수정 반영
  };
}

interface GetCellContentProps {
  columns: AvailableColumn[];
  data: PointHistoryNode[];
}

export const useGetPointHistoryCellContent = ({ columns, data }: GetCellContentProps) => {
  const { theme } = useTheme();

  return ([column, row]: Item, { added }: GetCellContentOpts): GridCell => {
    // 페이지네이션 등으로 인한 행 계산 (OrderList 참고)
    const rowData = data[row];
    const columnId = columns[column]?.id;

    if (!columnId || !rowData) {
      return readonlyTextCell("");
    }

    switch (columnId) {
      case "date":
        return dateCell(rowData.createdAt);

      case "hospital": {
        // [수정] user.businessName 사용
        const hospitalName = rowData.user?.businessName || "-";
        const email = rowData.user?.email ? `(${rowData.user.email})` : "";
        
        // 병원명과 이메일을 같이 표시 (예: "서울병원 (test@example.com)")
        return readonlyTextCell(`${hospitalName} ${email}`.trim());
      }

      case "type": {
        const isCredit = rowData.points > 0;
        const color = getStatusColor({
            status: isCredit ? "success" : "error", // 적립: 초록, 사용: 빨강
            currentTheme: theme,
        });
        return pillCell(isCredit ? "적립" : "사용", color);
      }

      case "points":
        return readonlyTextCell(`${rowData.points.toLocaleString()} P`);

      case "balanceAfterTransaction":
        return readonlyTextCell(`${rowData.balanceAfterTransaction.toLocaleString()} P`);

      case "reason":
        return readonlyTextCell(rowData.reason || "-");

      default:
        return readonlyTextCell("");
    }
  };
};