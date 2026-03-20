// src/popups/components/PopupListPage.tsx

import { Button } from "@dashboard/components/Button";
import CardSpacer from "@dashboard/components/CardSpacer";
import Container from "@dashboard/components/Container";
import PageHeader from "@dashboard/components/PageHeader";
import { TablePaginationWithContext } from "@dashboard/components/TablePagination";
import { PopupFragment } from "@dashboard/graphql";
import { PageListProps, SortPage } from "@dashboard/types";
import { Card, Checkbox, Table, TableBody, TableCell, TableFooter, TableHead, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles(
  theme => ({
    [theme.breakpoints.up("lg")]: {
      colTitle: { width: "auto" },
      colActive: { width: 150 },
      colPage: { width: 200 },
      colStartDate: { width: 220 },
      colEndDate: { width: 220 },
    },
    colTitle: {},
    colActive: {},
    colPage: {},
    colStartDate: {},
    colEndDate: {},
    link: { cursor: "pointer" },
  }),
  { name: "PopupListPage" },
);

interface PopupListPageProps extends PageListProps, SortPage<any> {
  popups: PopupFragment[];
  onAdd: () => void;
  onRowClick: (id: string) => void;
}

const PopupListPage: React.FC<PopupListPageProps> = ({
  popups,
  onAdd,
  onRowClick,
  ...listProps
}) => {
  const classes = useStyles();
  
  return (
    <Container>
      <CardSpacer />
      <PageHeader title={"팝업 관리"}>
        <Button variant="primary" onClick={onAdd}>
          팝업 생성
        </Button>
      </PageHeader>
      <CardSpacer />
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={classes.colTitle}>제목</TableCell>
              <TableCell className={classes.colActive}>활성 여부</TableCell>
              <TableCell className={classes.colPage}>노출 페이지</TableCell>
              <TableCell className={classes.colStartDate}>노출 시작일</TableCell>
              <TableCell className={classes.colEndDate}>노출 종료일</TableCell>
            </TableRow>
          </TableHead>
          <TableFooter>
            <TableRow>
              <TablePaginationWithContext
                colSpan={5}
                settings={listProps.settings}
                onUpdateListSettings={listProps.onUpdateListSettings}
              />
            </TableRow>
          </TableFooter>
          <TableBody>
            {popups?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>등록된 팝업이 없습니다.</TableCell>
              </TableRow>
            ) : (
              popups?.map(popup => (
                <TableRow
                  key={popup.id}
                  hover
                  className={classes.link}
                  onClick={() => onRowClick(popup.id)}
                >
                  <TableCell>{popup.title}</TableCell>
                  <TableCell>
                    <Checkbox checked={popup.isActive} disabled />
                  </TableCell>
                  <TableCell>{popup.displayPage}</TableCell>
                  <TableCell>{new Date(popup.startDate).toLocaleString()}</TableCell>
                  <TableCell>{new Date(popup.endDate).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </Container>
  );
};

export default PopupListPage;