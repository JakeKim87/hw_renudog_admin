import { Route } from "@dashboard/components/Router";
import { asSortParams } from "@dashboard/utils/sort";
import { parse as parseQs } from "qs";
import React from "react";
import { RouteComponentProps, Switch } from "react-router-dom";

import { WindowTitle } from "../components/WindowTitle";
import {
  depositHistoryListPath,
  DepositHistoryListUrlQueryParams,
  DepositHistoryListUrlSortField,
} from "./urls";
import { DepositHistoryList as DepositHistoryListComponent } from "./views/DepositHistoryList";


// 1. URL 파라미터를 파싱하여 View 컴포넌트에 전달하는 래퍼 컴포넌트
const DepositHistoryList: React.FC<RouteComponentProps<any>> = ({ location }) => {
   const qs = parseQs(location.search.substr(1)) as any;
  
  // URL 쿼리 스트링을 파싱하고, 정렬 기준이 없을 경우 기본값(Date)을 설정합니다.
  const params = asSortParams(
    qs,
    DepositHistoryListUrlSortField,
    DepositHistoryListUrlSortField.date,
    false, // false = 내림차순 (최신순)
  ) as DepositHistoryListUrlQueryParams;

  return <DepositHistoryListComponent params={params} />;
};

// 2. 메인 라우터 컴포넌트
const Component = () => {
  return (
    <>
      {/* 브라우저 탭 제목 설정 */}
      <WindowTitle title="전체 예치금 내역" />
      
      <Switch>
        {/* /deposit-history 경로로 들어오면 DepositHistoryList 컴포넌트를 렌더링 */}
        <Route exact path={depositHistoryListPath} component={DepositHistoryList} />
      </Switch>
    </>
  );
};

export default Component;