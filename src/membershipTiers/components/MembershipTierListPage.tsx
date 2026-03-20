// src/membershipTiers/components/MembershipTierListPage.tsx

import { Button } from "@dashboard/components/Button";
import CardSpacer from "@dashboard/components/CardSpacer";
import Container from "@dashboard/components/Container";
import PageHeader from "@dashboard/components/PageHeader";
import { MembershipTierFragment } from "@dashboard/graphql";
import { ListSettings, PageListProps } from "@dashboard/types";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { FormattedMessage } from "react-intl";

const useStyles = makeStyles(
  theme => ({
    // 필요에 따라 컬럼 너비 조정
    [theme.breakpoints.up("lg")]: {
      colGrade: { width: 150 },
      colValues: { width: 200 },
      colRate: { width: 150 },
    },
    colGrade: {},
    colValues: {},
    colRate: {},
    link: {
      cursor: "pointer",
    },
  }),
  { name: "MembershipTierListPage" },
);

// props에서 페이지네이션/정렬 관련 타입 제거
export interface MembershipTierListPageProps extends Omit<PageListProps, "onSort" | "sort"> {
  tiers: MembershipTierFragment[];
  settings: ListSettings;
  onUpdateListSettings: (key: keyof ListSettings, value: any) => void;
  onAdd: () => void;
  onRowClick: (id: string) => void;
}

const MembershipTierListPage: React.FC<MembershipTierListPageProps> = ({
  tiers,
  disabled,
  onAdd,
  onRowClick,
  ...listProps
}) => {
  const classes = useStyles();

  return (
    <Container>
      <CardSpacer />
      <PageHeader title={"회원 등급 관리"}>
        <Button variant="primary" onClick={onAdd}>
          <FormattedMessage id="add_tier" defaultMessage="등급 생성" />
        </Button>
      </PageHeader>
      <CardSpacer />
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={classes.colGrade}>등급</TableCell>
              <TableCell className={classes.colValues}>without_q</TableCell>
              <TableCell className={classes.colValues}>with_q</TableCell>
              <TableCell className={classes.colValues}>preserve</TableCell>
              <TableCell className={classes.colRate}>적립률 (%)</TableCell>
              <TableCell className={classes.colRate}>withoutQ 할인율 (%)</TableCell>
              <TableCell className={classes.colRate}>withQ 할인율 (%)</TableCell>
              <TableCell className={classes.colRate}>preserve 할인율 (%)</TableCell>
              <TableCell className={classes.colRate}>토큰 할인율 (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tiers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <FormattedMessage id="no_tiers_found" defaultMessage="생성된 등급이 없습니다." />
                </TableCell>
              </TableRow>
            ) : (
              tiers?.map(tier => (
                <TableRow
                  key={tier.id}
                  hover
                  className={classes.link}
                  onClick={() => onRowClick(tier.id)}
                >
                  <TableCell>{tier.grade}</TableCell>
                  <TableCell>{tier.withoutQ}</TableCell>
                  <TableCell>{tier.withQ}</TableCell>
                  <TableCell>{tier.preserve}</TableCell>
                  <TableCell>{tier.earningRate}</TableCell>
                  <TableCell>{tier.withoutQDiscountRate}</TableCell>
                  <TableCell>{tier.withQDiscountRate}</TableCell>
                  <TableCell>{tier.preserveDiscountRate}</TableCell>
                  <TableCell>{tier.tokenDiscountRate}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </Container>
  );
};

MembershipTierListPage.displayName = "MembershipTierListPage";
export default MembershipTierListPage;