import { asSortParams } from "@dashboard/utils/sort";
import { parse as parseQs } from "qs";
import React from "react";
import { Route, RouteComponentProps, Switch } from "react-router-dom";

import { WindowTitle } from "../components/WindowTitle";
import {
  noticeAddPath,
  noticeListPath,
  NoticeListUrlQueryParams,
  NoticeListUrlSortField,
  noticePath,
  NoticeUrlQueryParams,
} from "./urls";
import NoticeCreate from "./views/NoticeCreate";
import NoticeList from "./views/NoticeList";
import NoticeUpdate from "./views/NoticeUpdate";

const NoticeListView: React.FC<RouteComponentProps<any>> = ({ location }) => {
  const qs = parseQs(location.search.substr(1)) as any;

  // Faq 예제와 100% 동일하게, asSortParams를 사용하여 params를 생성합니다.
  const params: NoticeListUrlQueryParams = asSortParams(
    qs,
    NoticeListUrlSortField,
    NoticeListUrlSortField.createdAt, // 기본 정렬 기준
    false,
  );

  return <NoticeList params={params} />;
};

const NoticeUpdateView: React.FC<RouteComponentProps<{ id: string }>> = ({ match, location }) => {
  // Faq 예제와 100% 동일하게, location.search를 파싱합니다.
  const qs = parseQs(location.search.substr(1));
  const params: NoticeUrlQueryParams = qs as any;

  return <NoticeUpdate id={decodeURIComponent(match.params.id)} params={params} />;
};

const NoticeCreateView: React.FC = () => {
  return <NoticeCreate />;
};

const NoticeSection: React.FC = () => {
  return (
    <>
      <WindowTitle title={"공지사항"} />
      <Switch>
        <Route exact path={noticeListPath} component={NoticeListView} />
        <Route exact path={noticeAddPath} component={NoticeCreateView} />
        <Route path={noticePath(":id")} component={NoticeUpdateView} />
      </Switch>
    </>
  );
};

export default NoticeSection;