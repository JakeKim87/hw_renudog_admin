import CardSpacer from "@dashboard/components/CardSpacer";
import Container from "@dashboard/components/Container";
import PageHeader from "@dashboard/components/PageHeader";
import { TablePaginationWithContext } from "@dashboard/components/TablePagination";
import { AgencyTransferFragment, AgencyTransferStatusEnum } from "@dashboard/graphql";
import { ListSettings, ListViews } from "@dashboard/types";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { useIntl } from "react-intl";

// 스타일 정의
const useStyles = makeStyles(
  theme => ({
    // 필요에 따라 컬럼 너비 등을 반응형으로 조절할 수 있습니다.
    colNumber: { width: 150 },
    colAgency: { width: 200 },
    colDate: { width: 200 },
    colStatus: { width: 120 },
    colRecipient: { width: 150 },
    colAddress: { width: "auto" }, // 남은 공간 모두 사용
    link: {
      cursor: "pointer",
    },
  }),
  { name: "AgencyTransferListPage" },
);

// 상태(Enum) 값을 한글로 변환하는 헬퍼 함수
const getStatusText = (status: AgencyTransferStatusEnum, intl: any) => {
  switch (status) {
    case AgencyTransferStatusEnum.PENDING:
      return intl.formatMessage({ id: "status_pending", defaultMessage: "준비중" });
    case AgencyTransferStatusEnum.SHIPPED:
      return intl.formatMessage({ id: "status_shipped", defaultMessage: "배송중" });
    case AgencyTransferStatusEnum.DELIVERED:
      return intl.formatMessage({ id: "status_delivered", defaultMessage: "배송완료" });
    case AgencyTransferStatusEnum.CANCELLED:
      return intl.formatMessage({ id: "status_cancelled", defaultMessage: "취소됨" });
    default:
      return status;
  }
};

// 컴포넌트 Props 타입 정의
interface AgencyTransferListPageProps {
  transfers: AgencyTransferFragment[] | undefined;
  settings: ListSettings<ListViews.AGENCY_TRANSFER_LIST>;
  disabled: boolean;
  pageTitle: string;
  onUpdateListSettings: (
    key: keyof ListSettings<ListViews.AGENCY_TRANSFER_LIST>,
    value: any,
  ) => void;
  onRowClick: (id: string) => void;
}

const AgencyTransferListPage: React.FC<AgencyTransferListPageProps> = ({
  transfers,
  settings,
  disabled,
  pageTitle,
  onUpdateListSettings,
  onRowClick,
}) => {
  const classes = useStyles();
  const intl = useIntl();

  return (
    <Container>
      <CardSpacer />
      {/* 페이지 상단 헤더 */}
      <PageHeader title={pageTitle} />

      <Card>
        <Table>
          {/* 테이블 헤더 */}
          <TableHead>
            <TableRow>
              <TableCell className={classes.colNumber}>
                {intl.formatMessage({ id: "transfer_number", defaultMessage: "요청번호" })}
              </TableCell>
              <TableCell className={classes.colAgency}>
                {intl.formatMessage({ id: "agency", defaultMessage: "대리점" })}
              </TableCell>
              <TableCell className={classes.colDate}>
                {intl.formatMessage({ id: "created_at", defaultMessage: "요청일" })}
              </TableCell>
              <TableCell className={classes.colStatus}>
                {intl.formatMessage({ id: "status", defaultMessage: "상태" })}
              </TableCell>
              <TableCell className={classes.colRecipient}>
                {intl.formatMessage({ id: "recipient", defaultMessage: "수령인" })}
              </TableCell>
              <TableCell className={classes.colAddress}>
                {intl.formatMessage({ id: "address", defaultMessage: "주소" })}
              </TableCell>
            </TableRow>
          </TableHead>

          {/* 테이블 푸터 (페이지네이션) */}
          <TableFooter>
            <TableRow>
              <TablePaginationWithContext
                colSpan={6} // 테이블 컬럼 수와 일치
                settings={settings}
                onUpdateListSettings={onUpdateListSettings}
                disabled={disabled}
              />
            </TableRow>
          </TableFooter>

          {/* 테이블 바디 (데이터 목록) */}
          <TableBody>
            {/* 로딩 중이거나 데이터가 없을 때의 처리 */}
            {disabled && transfers === undefined ? (
              <TableRow>
                <TableCell colSpan={6}>
                  {intl.formatMessage({ id: "loading", defaultMessage: "로딩 중..." })}
                </TableCell>
              </TableRow>
            ) : transfers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  {intl.formatMessage({
                    id: "no_transfers_found",
                    defaultMessage: "출고 요청을 찾을 수 없습니다.",
                  })}
                </TableCell>
              </TableRow>
            ) : (
              // 데이터가 있을 때 목록 렌더링
              transfers?.map(transfer => (
                <TableRow
                  key={transfer.id}
                  hover
                  className={classes.link}
                  onClick={() => onRowClick(transfer.id)}
                >
                  <TableCell>{transfer.number}</TableCell>
                  <TableCell>{transfer.agency?.businessName || transfer.agency?.email}</TableCell>
                  <TableCell>{new Date(transfer.createdAt).toLocaleString("ko-KR")}</TableCell>
                  <TableCell>{getStatusText(transfer.status, intl)}</TableCell>
                  <TableCell>
                    {`${transfer.destinationAddress?.lastName || ""}${transfer.destinationAddress?.firstName || ""}`}
                  </TableCell>
                  <TableCell>
                    {`${transfer.destinationAddress?.streetAddress1 || ""} ${transfer.destinationAddress?.streetAddress2 || ""}`.trim()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </Container>
  );
};

export default AgencyTransferListPage;
