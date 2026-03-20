// src/events/components/EventListPage.tsx

import { Button } from "@dashboard/components/Button";
import CardSpacer from "@dashboard/components/CardSpacer";
import Container from "@dashboard/components/Container";
import PageHeader from "@dashboard/components/PageHeader";
import { TablePaginationWithContext } from "@dashboard/components/TablePagination";
import { EventFragment } from "@dashboard/graphql";
import { PageListProps, SortPage } from "@dashboard/types";
import { Card, Checkbox, Table, TableBody, TableCell, TableFooter, TableHead, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles(
  theme => ({
    colTitle: { width: "auto" },
    colActive: { width: 150 },
    colStartDate: { width: 220 },
    colEndDate: { width: 220 },
    colMultiplier: { width: 150 },
    link: { cursor: "pointer" },
    headerButton: {
      marginLeft: theme.spacing(2),
    },
  }),
  { name: "EventListPage" },
);

interface EventListPageProps extends PageListProps, SortPage<any> {
  events: EventFragment[];
  onAdd: () => void;
  onRowClick: (id: string) => void;
}

const EventListPage: React.FC<EventListPageProps> = ({ events, onAdd, onRowClick, ...listProps }) => {
  const classes = useStyles();
  
  return (
    <Container>
      <CardSpacer/>
      <PageHeader title={"이벤트 관리"}>
        <Button variant="primary" onClick={onAdd}>이벤트 생성</Button>
      </PageHeader>
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={classes.colTitle}>이벤트명</TableCell>
              <TableCell className={classes.colActive}>활성 여부</TableCell>
              <TableCell className={classes.colStartDate}>시작일</TableCell>
              <TableCell className={classes.colEndDate}>종료일</TableCell>
              <TableCell className={classes.colMultiplier}>포인트 배율</TableCell>
            </TableRow>
          </TableHead>
          <TableFooter>
            <TableRow>
              <TablePaginationWithContext colSpan={5} settings={listProps.settings} onUpdateListSettings={listProps.onUpdateListSettings} />
            </TableRow>
          </TableFooter>
          <TableBody>
            {events?.length === 0 ? (
              <TableRow><TableCell colSpan={5}>등록된 이벤트가 없습니다.</TableCell></TableRow>
            ) : (
              events?.map(event => (
                <TableRow key={event.id} hover className={classes.link} onClick={() => onRowClick(event.id)}>
                  <TableCell>{event.title}</TableCell>
                  <TableCell><Checkbox checked={event.isActive} disabled /></TableCell>
                  <TableCell>{new Date(event.startDate).toLocaleString()}</TableCell>
                  <TableCell>{new Date(event.endDate).toLocaleString()}</TableCell>
                  <TableCell>{event.pointMultiplier}배</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </Container>
  );
};

export default EventListPage;