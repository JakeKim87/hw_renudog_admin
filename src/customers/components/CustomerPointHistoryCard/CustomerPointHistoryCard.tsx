// @ts-strict-ignore
import ResponsiveTable from "@dashboard/components/ResponsiveTable";
import TableRowLink from "@dashboard/components/TableRowLink";
import {
  CustomerPointHistoryQuery,
} from "@dashboard/graphql";
import { orderUrl } from "@dashboard/orders/urls";
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
  Typography
} from "@material-ui/core";
// [추가] 스타일 정의를 위해 makeStyles 임포트
import { makeStyles } from "@material-ui/core/styles"; 
import React from "react";
import { FormattedMessage } from "react-intl";

interface CustomerPointHistoryCardProps {
  pointData: CustomerPointHistoryQuery["user"];
  pointHistoryLoading: boolean;
}

// [추가] 컬럼 너비 스타일 정의
// width에 퍼센트(%)나 픽셀(px) 값을 넣어 조절하세요.
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
    colPoints: {
      width: 200, // 포인트 컬럼 너비
      textAlign: "right",
    },
    colBalance: {
      width: 200, // 잔액 컬럼 너비
      textAlign: "right",
    },
  }),
  { name: "CustomerPointHistoryCard" }
);

const CustomerPointHistoryCard: React.FC<CustomerPointHistoryCardProps> = ({
  pointData,
  pointHistoryLoading,
}) => {
  const classes = useStyles(); // [추가] 스타일 훅 사용
  const pointHistory = pointData?.pointHistories;

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="h5">
            <FormattedMessage id="point_history" defaultMessage="포인트 내역" />
          </Typography>
        }
      />
      <CardContent>
        <ResponsiveTable>
          <TableHead>
            <TableRow>
              {/* [수정] 각 Header Cell에 className 적용 */}
              <TableCell className={classes.colDate}>
                날짜
              </TableCell>
              <TableCell className={classes.colReason}>
                내용
              </TableCell>
              <TableCell className={classes.colOrder}>
                관련 주문
              </TableCell>
              <TableCell className={classes.colPoints}>
                포인트
              </TableCell>
              <TableCell className={classes.colBalance}>
                잔액
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pointHistoryLoading && (
              <TableRow>
                <TableCell colSpan={5} style={{ textAlign: "center" }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            )}
            {!pointHistoryLoading && pointHistory?.edges.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <FormattedMessage id="no_history_found" defaultMessage="포인트 내역이 없습니다." />
                </TableCell>
              </TableRow>
            )}
            {!pointHistoryLoading &&
              pointHistory?.edges.map(({ node }) => (
                <TableRowLink key={node.id} href={node.order ? orderUrl(node.order.id) : undefined}>
                  <TableCell>
                    {new Date(node.createdAt).toLocaleString("ko-KR")}
                  </TableCell>
                  <TableCell>{node.reason}</TableCell>
                  <TableCell>{node.order ? `#${node.order.number}` : "—"}</TableCell>
                  <TableCell align="right">{node.points.toLocaleString()} P</TableCell>
                  <TableCell align="right">{node.balanceAfterTransaction.toLocaleString()} P</TableCell>
                </TableRowLink>
              ))}
          </TableBody>
        </ResponsiveTable>
      </CardContent>
    </Card>
  );
};

export default CustomerPointHistoryCard;