import { Route } from "@dashboard/components/Router";
import { asSortParams } from "@dashboard/utils/sort";
import { parse as parseQs } from "qs";
import React from "react";
import { RouteComponentProps, Switch } from "react-router-dom";

import { WindowTitle } from "../components/WindowTitle";
import {
  pointHistoryListPath,
  PointHistoryListUrlQueryParams,
  PointHistoryListUrlSortField,
} from "./urls";
import { PointHistoryList as PointHistoryListComponent } from "./views/PointHistoryList";


// 1. URL 파라미터를 파싱하여 View 컴포넌트에 전달하는 래퍼 컴포넌트
const PointHistoryList: React.FC<RouteComponentProps<any>> = ({ location }) => {
   const qs = parseQs(location.search.substr(1)) as any;
  
  // URL 쿼리 스트링을 파싱하고, 정렬 기준이 없을 경우 기본값(Date)을 설정합니다.
  const params = asSortParams(
    qs,
    PointHistoryListUrlSortField,
    PointHistoryListUrlSortField.date,
    false, // false = 내림차순 (최신순)
  ) as PointHistoryListUrlQueryParams;

  return <PointHistoryListComponent params={params} />;
};

// 2. 메인 라우터 컴포넌트
const Component = () => {
  return (
    <>
      {/* 브라우저 탭 제목 설정 */}
      <WindowTitle title="전체 포인트 내역" />
      
      <Switch>
        {/* /point-history 경로로 들어오면 PointHistoryList 컴포넌트를 렌더링 */}
        <Route exact path={pointHistoryListPath} component={PointHistoryList} />
      </Switch>
    </>
  );
};

export default Component;