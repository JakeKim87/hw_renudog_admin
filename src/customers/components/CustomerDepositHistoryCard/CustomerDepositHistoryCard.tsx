// @ts-strict-ignore
import { MutationResult } from "@apollo/client";
import { DateTime } from "@dashboard/components/Date";
import ResponsiveTable from "@dashboard/components/ResponsiveTable";
import TableRowLink from "@dashboard/components/TableRowLink";
import {
  CustomerDepositHistoryQuery,
} from "@dashboard/graphql";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

interface CustomerDepositHistoryCardProps {
  depositData: CustomerDepositHistoryQuery["user"];
  depositHistoryLoading: boolean;
  onDepositCancel: (historyId: string) => void;
  depositCancelOpts: MutationResult;
}

const useStyles = makeStyles(
  theme => ({
    colDate: {
      width: 250, // 날짜 컬럼 너비 (px)
    },
    colReason: {
      width: "auto", // 사유는 남은 공간을 모두 차지하도록 auto
    },
    colOrder: {
      width: 120, // 주문 번호 컬럼 너비
    },
    colAmount: {
      width: 200, // 금액 컬럼 너비
      textAlign: "right",
    },
    colBalance: {
      width: 200, // 잔액 컬럼 너비
      textAlign: "right",
    },
  }),
  { name: "CustomerPointHistoryCard" }
);

const CustomerDepositHistoryCard: React.FC<CustomerDepositHistoryCardProps> = ({
  depositData,
  depositHistoryLoading,
  onDepositCancel,
  depositCancelOpts,
}) => {
  const classes = useStyles();
  const depositHistory = depositData?.depositHistories;

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="h5">
            <FormattedMessage id="deposit_history" defaultMessage="예치금 내역" />
          </Typography>
        }
      />
      <CardContent>
        <ResponsiveTable>
          <TableHead>
            <TableRow>
              <TableCell className={classes.colDate}>
                날짜
              </TableCell>
              <TableCell className={classes.colReason}>
                내용
              </TableCell>
              <TableCell className={classes.colAmount}>
                금액
              </TableCell>
              <TableCell className={classes.colBalance}>
                잔액
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {depositHistoryLoading && (
              <TableRow>
                <TableCell colSpan={5} style={{ textAlign: "center" }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            )}
            {!depositHistoryLoading && depositHistory?.edges.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <FormattedMessage id="no_history_found" defaultMessage="예치금 내역이 없습니다." />
                </TableCell>
              </TableRow>
            )}
            {!depositHistoryLoading &&
              depositHistory?.edges.map(({ node }) => {
                const isCancellable = !!node.paymentKey && !node.reason.includes("취소");
                const hasEnoughBalance = depositData?.depositWallet?.balance >= Math.abs(node.amount);

                return (
                  <TableRowLink key={node.id}>
                    <TableCell>
                      {new Date(node.createdAt).toLocaleString("ko-KR")}
                    </TableCell>
                    <TableCell>{node.reason}</TableCell>
                    <TableCell align="right">{node.amount.toLocaleString()} 원</TableCell>
                    <TableCell align="right">{node.balanceAfterTransaction.toLocaleString()}원</TableCell>
                  </TableRowLink>
                );
              })}
          </TableBody>
        </ResponsiveTable>
      </CardContent>
    </Card>
  );
};

export default CustomerDepositHistoryCard;