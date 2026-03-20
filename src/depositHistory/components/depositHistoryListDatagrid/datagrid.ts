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

export const depositHistoryStaticColumns = [
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
    id: "amount",
    title: "금액",
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
    width: 300, // 사유가 길 수 있으니 적절히 조절
  },
];

// 2. 데이터 인터페이스 정의
interface DepositHistoryNode {
  id: string;
  createdAt: string;
  amount: number; // [변경] points -> amount
  balanceAfterTransaction: number;
  reason: string;
  user?: {
    email: string;
    businessName?: string;
  };
  // 필요하다면 status, paymentMethodName 등을 추가할 수 있습니다.
}

interface GetCellContentProps {
  columns: AvailableColumn[];
  data: DepositHistoryNode[];
}

// 3. 셀 컨텐츠 생성 훅
export const useGetDepositHistoryCellContent = ({
  columns,
  data,
}: GetCellContentProps) => {
  const { theme } = useTheme();

  return ([column, row]: Item, { added }: GetCellContentOpts): GridCell => {
    const rowData = data[row];
    const columnId = columns[column]?.id;

    if (!columnId || !rowData) {
      return readonlyTextCell("");
    }

    switch (columnId) {
      case "date":
        return dateCell(rowData.createdAt);

      case "hospital": {
        const hospitalName = rowData.user?.businessName || "-";
        const email = rowData.user?.email ? `(${rowData.user.email})` : "";
        return readonlyTextCell(`${hospitalName} ${email}`.trim());
      }

      case "type": {
        // [변경] amount 기준 판단
        const isCredit = rowData.amount > 0;
        const color = getStatusColor({
          status: isCredit ? "success" : "error", // 적립(입금): 초록, 차감(출금): 빨강
          currentTheme: theme,
        });
        return pillCell(isCredit ? "적립" : "차감", color);
      }

      case "amount":
        // [변경] '원' 단위 사용
        return readonlyTextCell(`${rowData.amount.toLocaleString()}원`);
      case "balanceAfterTransaction":
        // [변경] '원' 단위 사용
        return readonlyTextCell(`${rowData.balanceAfterTransaction.toLocaleString()}원`);

      case "reason":
        return readonlyTextCell(rowData.reason || "-");

      default:
        return readonlyTextCell("");
    }
  };
};