import ResponsiveTable from "@dashboard/components/ResponsiveTable";
import TableRowLink from "@dashboard/components/TableRowLink";
import { orderUrl } from "@dashboard/orders/urls"; // 주문 상세 페이지 이동을 위함
import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

// GraphQL Query 결과 타입에 맞게 정의 (기존의 pointData와 유사한 구조)
interface CustomerCashHistoryCardProps {
  cashData: any; // 실제 환경에서는 CustomerCashHistoryQuery["user"] 등을 사용하세요.
  cashHistoryLoading: boolean;
}

const useStyles = makeStyles(
  theme => ({
    colDate: {
      width: 180,
    },
    colReason: {
      width: "auto",
    },
    colOrder: {
      width: 120,
    },
    colAmount: {
      width: 140,
      textAlign: "right",
      fontWeight: "bold",
    },
    colBalance: {
      width: 140,
      textAlign: "right",
    },
    // 미수금 발생 (채무 증가) - 빨간색 계열
    debt: {
      color: theme.palette.error.main,
    },
    // 미수금 상환 (입금 확인) - 파란색/초록색 계열
    repayment: {
      color: theme.palette.primary.main,
    },
  }),
  { name: "CustomerCashHistoryCard" },
);

const CustomerCashHistoryCard: React.FC<CustomerCashHistoryCardProps> = ({
  cashData,
  cashHistoryLoading,
}) => {
  const classes = useStyles();
  const cashHistory = cashData?.cashHistories;

  return (
    <Card>
      <CardHeader title={<Typography variant="h5">미수금(후불) 상세 내역</Typography>} />
      <CardContent>
        <ResponsiveTable>
          <TableHead>
            <TableRow>
              <TableCell className={classes.colDate}>날짜</TableCell>
              <TableCell className={classes.colReason}>내용</TableCell>
              <TableCell className={classes.colOrder}>관련 주문</TableCell>
              <TableCell className={classes.colAmount}>변동 금액</TableCell>
              <TableCell className={classes.colBalance}>미수금 잔액</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cashHistoryLoading && (
              <TableRow>
                <TableCell colSpan={5} style={{ textAlign: "center" }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            )}
            {!cashHistoryLoading && cashHistory?.edges.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>미수금 내역이 없습니다.</TableCell>
              </TableRow>
            )}
            {!cashHistoryLoading &&
              cashHistory?.edges.map(({ node }) => {
                const isDebt = node.amount > 0; // 양수면 미수 발생, 음수면 상환

                return (
                  <TableRowLink
                    key={node.id}
                    href={node.order ? orderUrl(node.order.id) : undefined}
                  >
                    <TableCell>
                      {new Date(node.createdAt).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>{node.reason}</TableCell>
                    <TableCell>{node.order ? `#${node.order.number}` : "—"}</TableCell>

                    <TableCell
                      className={`${classes.colAmount} ${
                        isDebt ? classes.debt : classes.repayment
                      }`}
                    >
                      {/* 상환일 경우 앞에 '+' 기호를 빼고 표시하거나 금액 그대로 표시 */}
                      {node.amount > 0
                        ? `+${node.amount.toLocaleString()}`
                        : node.amount.toLocaleString()}{" "}
                      원
                    </TableCell>

                    <TableCell className={classes.colBalance}>
                      {node.balanceAfterTransaction.toLocaleString()} 원
                    </TableCell>
                  </TableRowLink>
                );
              })}
          </TableBody>
        </ResponsiveTable>
      </CardContent>
    </Card>
  );
};

export default CustomerCashHistoryCard;
