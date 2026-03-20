// src/membershipTiers/index.tsx

import { parse as parseQs } from "qs";
import React from "react";
import { Route, RouteComponentProps, Switch } from "react-router-dom";

import { WindowTitle } from "../components/WindowTitle";
import {
  membershipTierAddPath,
  membershipTierListPath,
  MembershipTierListUrlQueryParams,
  membershipTierPath,
  MembershipTierUrlQueryParams,
} from "./urls";
// 👇 생성(Create) 및 수정(Update) 뷰 컴포넌트를 import 합니다.
import MembershipTierCreate from "./views/MembershipTierCreate";
import MembershipTierList from "./views/MembershipTierList";
import MembershipTierUpdate from "./views/MembershipTierUpdate";

// 목록 뷰를 위한 래퍼(Wrapper) 컴포넌트
const MembershipTierListView: React.FC<RouteComponentProps<any>> = ({
  location,
}) => {
  // URL 쿼리 스트링을 파싱합니다. (예: ?action=delete)
  // 정렬/필터 관련 로직은 모두 제거되었습니다.
  const qs = parseQs(location.search.substr(1));
  const params: MembershipTierListUrlQueryParams = qs as any;

  return <MembershipTierList params={params} />;
};

// 수정 뷰를 위한 래퍼 컴포넌트
const MembershipTierUpdateView: React.FC<
  RouteComponentProps<{ id: string }>
> = ({ match, location }) => {
  // URL 쿼리 스트링을 파싱합니다. (예: ?action=remove)
  const qs = parseQs(location.search.substr(1));
  const params: MembershipTierUrlQueryParams = qs as any;

  return (
    <MembershipTierUpdate
      id={decodeURIComponent(match.params.id)}
      params={params}
    />
  );
};

// 생성 뷰를 위한 래퍼 컴포넌트
const MembershipTierCreateView: React.FC = () => {
  return <MembershipTierCreate />;
};

// 전체 섹션의 라우팅을 담당하는 메인 컴포넌트
const MembershipTierSection: React.FC = () => (
  <>
    <WindowTitle title={"회원 등급 관리"} />
    <Switch>
      <Route
        exact
        path={membershipTierListPath}
        component={MembershipTierListView}
      />
      <Route
        exact
        path={membershipTierAddPath}
        component={MembershipTierCreateView}
      />
      <Route path={membershipTierPath(":id")} component={MembershipTierUpdateView} />
    </Switch>
  </>
);

export default MembershipTierSection;