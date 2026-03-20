import { asSortParams } from "@dashboard/utils/sort";
import { parse as parseQs } from "qs";
import React from "react";
import { Route, RouteComponentProps, Switch } from "react-router-dom";

import { WindowTitle } from "../components/WindowTitle";
import {
  faqAddPath,
  faqListPath,
  FaqListUrlQueryParams,
  FaqListUrlSortField,
  faqPath,
  FaqUrlQueryParams,
} from "./urls";
import FaqCreate from "./views/FaqCreate";
import FaqList from "./views/FaqList";
import FaqUpdate from "./views/FaqUpdate";

const FaqListView: React.FC<RouteComponentProps<any>> = ({ location }) => {
  const qs = parseQs(location.search.substr(1)) as any;
  
  // 2. 이제 qs는 타입 검사를 통과하며, asSortParams의 반환값도 타입 단언으로 처리합니다.
  const params: FaqListUrlQueryParams = asSortParams(
    qs,
    FaqListUrlSortField,
    FaqListUrlSortField.createdAt,
    false,
  );
  
  return <FaqList params={params} />;
};

const FaqUpdateView: React.FC<RouteComponentProps<{ id: string }>> = ({ match }) => {
  const qs = parseQs(location.search.substr(1));
  const params: FaqUrlQueryParams = qs;

  return <FaqUpdate id={decodeURIComponent(match.params.id)} params={params} />;
};

const FaqCreateView: React.FC = () => {
  return <FaqCreate />;
};

const FaqSection: React.FC = () => {

  return (
    <>
      <WindowTitle title={"FAQ"} />
      <Switch>
        <Route exact path={faqListPath} component={FaqListView} />
        <Route exact path={faqAddPath} component={FaqCreateView} />
        <Route path={faqPath(":id")} component={FaqUpdateView} />
      </Switch>
    </>
  );
};

export default FaqSection;