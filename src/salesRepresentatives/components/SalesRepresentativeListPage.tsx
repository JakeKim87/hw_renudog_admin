import { Button } from "@dashboard/components/Button";
import CardSpacer from "@dashboard/components/CardSpacer";
import Container from "@dashboard/components/Container";
import PageHeader from "@dashboard/components/PageHeader";
import { SalesRepresentativesQuery } from "@dashboard/graphql"; // 생성된 타입 import
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

// GraphQL 쿼리 결과에서 node 타입을 추출
type RepFragment = NonNullable<SalesRepresentativesQuery["salesRepresentatives"]>["edges"][0]["node"];

const useStyles = makeStyles(
  theme => ({
    [theme.breakpoints.up("lg")]: {
      colName: { width: "40%" },
      colPhone: { width: "30%" },
      colEmail: { width: "30%" },
    },
    colName: {},
    colPhone: {},
    colEmail: {},
    link: {
      cursor: "pointer",
    },
  }),
  { name: "SalesRepresentativeListPage" },
);

export interface SalesRepresentativeListPageProps extends Omit<PageListProps, "onSort" | "sort"> {
  reps: RepFragment[];
  settings: ListSettings;
  onUpdateListSettings: (key: keyof ListSettings, value: any) => void;
  onAdd: () => void;
  onRowClick: (id: string) => void;
}

const SalesRepresentativeListPage: React.FC<SalesRepresentativeListPageProps> = ({
  reps,
  disabled,
  onAdd,
  onRowClick,
}) => {
  const classes = useStyles();

  return (
    <Container>
      <CardSpacer />
      <PageHeader title={"담당자 관리"}>
        <Button variant="primary" onClick={onAdd}>
          담당자 생성
        </Button>
      </PageHeader>
      <CardSpacer />
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={classes.colName}>이름</TableCell>
              <TableCell className={classes.colPhone}>전화번호</TableCell>
              <TableCell className={classes.colEmail}>이메일</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reps?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>
                  생성된 고객사 담당자가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              reps?.map(rep => (
                <TableRow
                  key={rep.id}
                  hover
                  className={classes.link}
                  onClick={() => onRowClick(rep.id)}
                >
                  <TableCell>{rep.name}</TableCell>
                  <TableCell>{rep.phoneNumber}</TableCell>
                  <TableCell>{rep.email}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </Container>
  );
};

SalesRepresentativeListPage.displayName = "SalesRepresentativeListPage";
export default SalesRepresentativeListPage;