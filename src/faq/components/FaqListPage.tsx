import { Button } from "@dashboard/components/Button";
import { CardSpacer } from "@dashboard/components/CardSpacer";
import Container from "@dashboard/components/Container";
import PageHeader from "@dashboard/components/PageHeader";
import { TablePaginationWithContext } from "@dashboard/components/TablePagination";
import { FaqFragment, PageInfoFragment } from "@dashboard/graphql"; // <-- 코드 생성 후에는 이 타입이 정상적으로 인식됩니다.
import { PageListProps, SortPage } from "@dashboard/types";
import { Card, Table, TableBody, TableCell, TableFooter, TableHead, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles"; // 스타일링을 위해 추가
import React from "react";

// Saleor 대시보드 표준 스타일을 위한 useStyles
const useStyles = makeStyles(
  theme => ({
    [theme.breakpoints.up("lg")]: {
      colTitle: {
        width: "auto",
      },
      colAuthor: {
        width: 200,
      },
      colDate: {
        width: 200,
      },
      colViews: {
        width: 150,
      },
    },
    colTitle: {},
    colAuthor: {},
    colDate: {},
    colViews: {},
    link: {
      cursor: "pointer",
    },
  }),
  { name: "FaqListPage" },
);

interface FaqListPageProps extends PageListProps, SortPage<any> {
  faqs: FaqFragment[];
  onAdd: () => void;
  onRowClick: (id: string) => void;
}


const FaqListPage: React.FC<FaqListPageProps> = ({
  faqs,
  onAdd,
  onRowClick,
  ...listProps
}) => {

  const classes = useStyles();

  return (
    <Container>
      <CardSpacer />
      <PageHeader title={"FAQ"}>
        <Button variant="primary" onClick={onAdd}>
          FAQ 생성
        </Button>
      </PageHeader>
      <CardSpacer />
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={classes.colTitle}>제목</TableCell>
              <TableCell className={classes.colAuthor}>작성자</TableCell>
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
            {faqs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  등록하신 FAQ가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              faqs?.map(faq => (
                <TableRow 
                  key={faq.id} 
                  hover 
                  className={classes.link}
                  onClick={() => onRowClick(faq.id)}
                >
                  <TableCell>{faq.title}</TableCell>
                  <TableCell>{faq.author}</TableCell>
                  <TableCell>{new Date(faq.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{faq.viewCount}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </Container>
  );
};



export default FaqListPage;