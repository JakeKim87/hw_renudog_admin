import { Button } from "@dashboard/components/Button";
import CardSpacer from "@dashboard/components/CardSpacer";
import Container from "@dashboard/components/Container";
import PageHeader from "@dashboard/components/PageHeader";
import { TablePaginationWithContext } from "@dashboard/components/TablePagination";
import { NoticeFragment } from "@dashboard/graphql";
import { PageListProps, SortPage } from "@dashboard/types";
import { Card, Checkbox,Table, TableBody, TableCell, TableFooter, TableHead, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles(
  theme => ({
    [theme.breakpoints.up("lg")]: {
      colTitle: { width: "auto" },
      colPublished: { width: 200 },
      colDate: { width: 200 },
      colViews: { width: 150 },
    },
    colTitle: {},
    colPublished: {},
    colDate: {},
    colViews: {},
    link: { cursor: "pointer" },
  }),
  { name: "NoticeListPage" },
);

interface NoticeListPageProps extends PageListProps, SortPage<any> {
  notices: NoticeFragment[];
  onAdd: () => void;
  onRowClick: (id: string) => void;
}

const NoticeListPage: React.FC<NoticeListPageProps> = ({
  notices,
  onAdd,
  onRowClick,
  ...listProps
}) => {
  const classes = useStyles();
  
  return (
    <Container>
      <CardSpacer />
      <PageHeader title={"공지사항"}>
        <Button variant="primary" onClick={onAdd}>
          공지사항 생성
        </Button>
      </PageHeader>
      <CardSpacer />
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={classes.colTitle}>제목</TableCell>
              <TableCell className={classes.colPublished}>게시 여부</TableCell>
              <TableCell className={classes.colDate}>작성일</TableCell>
              <TableCell className={classes.colViews}>조회수</TableCell>
            </TableRow>
          </TableHead>
          <TableFooter>
            <TableRow>
              <TablePaginationWithContext
                colSpan={4}
                settings={listProps.settings}
                onUpdateListSettings={listProps.onUpdateListSettings}
              />
            </TableRow>
          </TableFooter>
          <TableBody>
            {notices?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>등록된 공지사항이 없습니다.</TableCell>
              </TableRow>
            ) : (
              notices?.map(notice => (
                <TableRow
                  key={notice.id}
                  hover
                  className={classes.link}
                  onClick={() => onRowClick(notice.id)}
                >
                  <TableCell>{notice.title}</TableCell>
                  <TableCell>
                    <Checkbox checked={notice.isPublished} disabled />
                  </TableCell>
                  <TableCell>{new Date(notice.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{notice.viewCount}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </Container>
  );
};

export default NoticeListPage;