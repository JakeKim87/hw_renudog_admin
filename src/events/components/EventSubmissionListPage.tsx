// src/events/components/EventSubmissionListPage.tsx

import { CardSpacer } from "@dashboard/components/CardSpacer";
import Container from "@dashboard/components/Container";
import PageHeader from "@dashboard/components/PageHeader";
import { TablePaginationWithContext } from "@dashboard/components/TablePagination";
import { EventSubmissionFragment } from "@dashboard/graphql";
import { PageListProps, SortPage } from "@dashboard/types";
import { Card, Chip, FormControl, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableFooter, TableHead, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles(
  theme => ({
    colParticipant: { width: 250 },
    colType: { width: 200 },
    colStatus: { width: 150 },
    colSubmittedAt: { width: 220 },
    colPoints: { width: 120 },
    link: { cursor: "pointer" },
    chip: {
        fontSize: "1.2rem",
        fontWeight: 500,
        padding: theme.spacing(0.5, 1),
    },
    filterContainer: {
      padding: theme.spacing(2, 0),
      display: "flex",
      alignItems: "flex-end",
      gap: theme.spacing(2),
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(0.5),
    },
    formControl: {
      minWidth: 180,
    },
  }),
  { name: "EventSubmissionListPage" },
);

// 상태에 따라 칩 색상을 반환하는 헬퍼 함수
const getStatusChipColor = (status: string): "primary" | "secondary" | "default" => {
  switch (status) {
    case "approved": return "primary";
    case "rejected": return "secondary";
    default: return "default";
  }
};
// 상태 한글 변환
const getStatusText = (status: string) => {
    switch (status) {
        case "pending": return "승인대기";
        case "approved": return "승인완료";
        case "rejected": return "반려";
        case "on_hold": return "보류";
        default: return status.toUpperCase();
    }
}

const STATUS_OPTIONS = ["pending", "approved", "rejected", "on_hold"];

interface EventSubmissionListPageProps extends PageListProps, SortPage<any> {
  submissions: EventSubmissionFragment[];
  onRowClick: (id: string) => void;
  filterValues: { status?: string };
  onFilterChange: (filters: { status?: string }) => void;
}

const EventSubmissionListPage: React.FC<EventSubmissionListPageProps> = ({
  submissions, 
  onRowClick,
  filterValues,
  onFilterChange,
  ...listProps 
}) => {

  const classes = useStyles();

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newStatus = event.target.value as string;
    onFilterChange({ status: newStatus === "" ? undefined : newStatus });
  };
  
  return (
    <Container>
      <CardSpacer />
      <PageHeader title={"제출 내역 관리"} />
      <CardSpacer />
      <Card>
        <div className={classes.filterContainer}>
          <div className={classes.filterGroup}>
            <InputLabel shrink>상태</InputLabel>
            <FormControl variant="outlined" size="small" className={classes.formControl}>
              <Select
                value={filterValues.status || ""}
                onChange={handleStatusChange}
                displayEmpty
              >
                <MenuItem value="">전체</MenuItem>
                {STATUS_OPTIONS.map(opt => (
                  <MenuItem key={opt} value={opt}>
                    {getStatusText(opt)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={classes.colParticipant}>참가자 (병원)</TableCell>
              <TableCell className={classes.colType}>콘텐츠 유형</TableCell>
              <TableCell className={classes.colStatus}>상태</TableCell>
              <TableCell className={classes.colSubmittedAt}>제출일</TableCell>
              <TableCell className={classes.colPoints}>승인 포인트</TableCell>
            </TableRow>
          </TableHead>
          <TableFooter>
            <TableRow>
              <TablePaginationWithContext colSpan={5} settings={listProps.settings} onUpdateListSettings={listProps.onUpdateListSettings} />
            </TableRow>
          </TableFooter>
          <TableBody>
            {submissions?.length === 0 ? (
              <TableRow><TableCell colSpan={5}>제출된 내역이 없습니다.</TableCell></TableRow>
            ) : (
              submissions?.map(sub => (
                <TableRow key={sub.id} hover className={classes.link} onClick={() => onRowClick(sub.id)}>
                  <TableCell>{sub.participant.businessName}</TableCell>
                  <TableCell>{sub.contentType.name}</TableCell>
                  <TableCell>
                    <Chip
                      className={classes.chip}
                      color={getStatusChipColor(sub.status)}
                      label={getStatusText(sub.status)}
                    />
                  </TableCell>
                  <TableCell>{new Date(sub.submittedAt).toLocaleString()}</TableCell>
                  <TableCell>{sub.approvedPoints ?? "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </Container>
  );
};

export default EventSubmissionListPage;