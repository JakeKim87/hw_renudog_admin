// src/events/index.tsx

import { asSortParams } from "@dashboard/utils/sort";
import { parse as parseQs } from "qs";
import React from "react";
import { Route, RouteComponentProps, Switch } from "react-router-dom";

import { WindowTitle } from "../components/WindowTitle";
import {
  eventAddPath,
  eventListPath,
  EventListUrlQueryParams,
  EventListUrlSortField,
  eventPath,
  eventSubmissionListPath,
  EventSubmissionListUrlQueryParams,
  EventSubmissionListUrlSortField,
  eventSubmissionPath,
  EventSubmissionUrlQueryParams,
  EventUrlQueryParams,
} from "./urls";
import EventCreate from "./views/EventCreate";
import EventList from "./views/EventList";
import EventSubmissionList from "./views/EventSubmissionList";
import EventSubmissionUpdate from "./views/EventSubmissionUpdate";
import EventUpdate from "./views/EventUpdate";

// --- 1. 이벤트 목록 뷰 ---
const EventListView: React.FC<RouteComponentProps<any>> = ({ location }) => {
  const qs = parseQs(location.search.substr(1)) as any;
  const params: EventListUrlQueryParams = asSortParams(
    qs,
    EventListUrlSortField,
    EventListUrlSortField.startDate,
    false,
  );
  return <EventList params={params} />;
};

// --- 2. 이벤트 수정 뷰 ---
const EventUpdateView: React.FC<RouteComponentProps<{ id: string }>> = ({ match, location }) => {
  const qs = parseQs(location.search.substr(1));
  const params: EventUrlQueryParams = qs as any;
  return <EventUpdate id={decodeURIComponent(match.params.id)} params={params} />;
};

// --- 3. 제출 내역 목록 뷰 ---
const EventSubmissionListView: React.FC<RouteComponentProps<any>> = ({ location }) => {
  const qs = parseQs(location.search.substr(1)) as any;
  const params: EventSubmissionListUrlQueryParams = asSortParams(
    qs,
    EventSubmissionListUrlSortField,
    EventSubmissionListUrlSortField.submittedAt,
    false,
  );
  return <EventSubmissionList params={params} />;
};

// --- 4. 제출 내역 수정 뷰 ---
const EventSubmissionUpdateView: React.FC<RouteComponentProps<{ id: string }>> = ({ match, location }) => {
  const qs = parseQs(location.search.substr(1));
  const params: EventSubmissionUrlQueryParams = qs as any;
  return <EventSubmissionUpdate id={decodeURIComponent(match.params.id)} params={params} />;
};

// --- 메인 이벤트 섹션 라우터 ---
const EventSection: React.FC = () => {
  return (
    <>
      <WindowTitle title={"이벤트 관리"} />
      <Switch>
        {/* 이벤트 관련 라우트 */}
        <Route exact path={eventListPath} component={EventListView} />
        <Route exact path={eventAddPath} component={EventCreate} />
        
        {/* 제출 내역 관련 라우트 */}
        <Route exact path={eventSubmissionListPath} component={EventSubmissionListView} />
        <Route path={eventSubmissionPath(":id")} component={EventSubmissionUpdateView} />

        {/* 이벤트 수정 라우트는 가장 마지막에 위치해야 합니다. */}
        {/* (경로가 더 일반적이어서 다른 라우트를 덮어쓸 수 있기 때문) */}
        <Route path={eventPath(":id")} component={EventUpdateView} />
      </Switch>
    </>
  );
};

export default EventSection;