import { Button } from "@dashboard/components/Button";
import CardSpacer from "@dashboard/components/CardSpacer";
import Container from "@dashboard/components/Container";
import Grid from "@dashboard/components/Grid";
import PageHeader from "@dashboard/components/PageHeader";
import { AgencyTransferFragment } from "@dashboard/graphql";
import { Card, CardContent, Typography } from "@material-ui/core";
// 1. makeStyles 임포트 추가
import { makeStyles } from "@material-ui/core/styles";
import { Skeleton } from "@saleor/macaw-ui-next";
import React from "react";

// 2. 스타일 정의 (상단 여백 설정)
const useStyles = makeStyles(
  theme => ({
    root: {
      paddingTop: theme.spacing(4), // 기본 간격 단위(8px) * 4 = 32px
      // 필요에 따라 paddingBottom 도 추가 가능
      // paddingBottom: theme.spacing(4),
    },
  }),
  { name: "AgencyTransferDetailsPage" },
);

interface AgencyTransferDetailsPageProps {
  transfer: AgencyTransferFragment | undefined;
  loading: boolean;
  onUpdate: () => void;
}

const AgencyTransferDetailsPage: React.FC<AgencyTransferDetailsPageProps> = ({
  transfer,
  loading,
  onUpdate,
}) => {
  // 3. 스타일 훅 사용
  const classes = useStyles();

  return (
    // 4. Container에 className 적용
    <Container className={classes.root}>
      <PageHeader title={`출고 요청 #${transfer?.number || "..."}`}>
        <Button variant="primary" onClick={onUpdate}>
          출고 처리
        </Button>
      </PageHeader>
      <Grid>
        <div>
          <Card>
            <CardContent>
              <Typography variant="h6">요청 정보</Typography>
              <CardSpacer />
              {loading && !transfer ? (
                <Skeleton />
              ) : (
                <>
                  <Typography>요청 번호: {transfer?.number}</Typography>
                  <Typography>
                    요청일: {new Date(transfer?.createdAt).toLocaleString("ko-KR")}
                  </Typography>
                  <Typography>
                    요청 대리점: {transfer?.agency.businessName || transfer?.agency.email}
                  </Typography>
                  <Typography>상태: {transfer?.status}</Typography>
                </>
              )}
            </CardContent>
          </Card>
          <CardSpacer />
          <Card>
            <CardContent>
              <Typography variant="h6">배송 정보</Typography>
              <CardSpacer />
              {loading && !transfer ? (
                <Skeleton />
              ) : (
                <>
                  <Typography>
                    수령인:{" "}
                    {`${transfer?.destinationAddress.lastName || ""}${transfer?.destinationAddress.firstName || ""}`}
                  </Typography>
                  <Typography>연락처: {transfer?.destinationAddress.phone}</Typography>
                  <Typography>
                    주소: ({transfer?.destinationAddress.postalCode}){" "}
                    {transfer?.destinationAddress.streetAddress1}{" "}
                    {transfer?.destinationAddress.streetAddress2}
                  </Typography>
                  <CardSpacer />
                  {/* 데이터베이스의 carrier 값과 상관없이 롯데택배로 표시 */}
                  <Typography>배송사: 롯데택배</Typography>
                  <Typography>송장번호: {transfer?.trackingNumber || "-"}</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent>
              <Typography variant="h6">요청 상품</Typography>
              <CardSpacer />
              {loading && !transfer ? (
                <Skeleton />
              ) : (
                transfer?.lines.map(line => (
                  <div key={line.id}>
                    <Typography>{`${line.productVariantName} x ${line.quantity}개`}</Typography>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <CardSpacer />
          <Card>
            <CardContent>
              <Typography variant="h6">메모</Typography>
              <CardSpacer />
              {loading && !transfer ? (
                <Skeleton />
              ) : (
                <>
                  <Typography variant="subtitle2">대리점 메모:</Typography>
                  <Typography>{transfer?.note || "-"}</Typography>
                  <CardSpacer />
                  <Typography variant="subtitle2">관리자 메모:</Typography>
                  <Typography>{transfer?.adminNote || "-"}</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </Grid>
    </Container>
  );
};

export default AgencyTransferDetailsPage;
