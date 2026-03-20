import { makeStyles } from "@saleor/macaw-ui";
import React, { PropsWithChildren } from "react";

import { useUser } from "..";
import LoginLoading from "./LoginLoading";

const useStyles = makeStyles(
  theme => ({
    // 전체 화면을 덮는 루트 컨테이너
    root: {
      alignItems: "center", // 수평 중앙 정렬 (flex-direction이 column이므로)
      background: theme.palette.background.default,
      display: "flex",
      flexDirection: "column", // 자식 요소들을 세로로 쌓음
      height: "100vh",
      justifyContent: "center", // 수직 중앙 정렬
      width: "100vw",
    },
    // 새로 추가된 타이틀 스타일
    title: {
      color: theme.palette.text.primary,
      fontSize: "2rem", // 글자 크기
      fontWeight: 600, // 글자 굵기
      marginBottom: theme.spacing(4), // 아래쪽 로그인 박스와의 간격
    },
    // 로그인 폼이 들어갈 박스
    content: {
      background: theme.palette.background.paper,
      borderRadius: theme.spacing(1),
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
      padding: theme.spacing(4, 6),
      width: "100%",
      maxWidth: 400,
    },
  }),
  {
    name: "Layout",
  },
);

const Layout: React.FC = (props: PropsWithChildren) => {
  const { children } = props;
  const { errors } = useUser();
  const classes = useStyles(props);

  // 이 로직은 외부 로그인 오류 시 리디렉션을 위한 것이므로 유지합니다.
  if (errors.some(item => item === "externalLoginError")) {
    return <LoginLoading />;
  }

  return (
    <div className={classes.root}>
      <h2 className={classes.title}>리뉴독 관리자 로그인</h2>
      <div className={classes.content}>{children}</div>
    </div>
  );
};

Layout.displayName = "Layout";
export default Layout;
