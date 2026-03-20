import { parse as parseQs } from "qs";
import React from "react";
import { Route, RouteComponentProps, Switch } from "react-router-dom";

import { WindowTitle } from "../components/WindowTitle";
import {
  salesRepresentativeAddPath,
  salesRepresentativeListPath,
  SalesRepresentativeListUrlQueryParams,
  salesRepresentativePath,
  SalesRepresentativeUrlQueryParams,
} from "./urls";
import SalesRepresentativeCreate from "./views/SalesRepresentativeCreate";
import SalesRepresentativeList from "./views/SalesRepresentativeList";
import SalesRepresentativeUpdate from "./views/SalesRepresentativeUpdate";

const SalesRepresentativeListView: React.FC<RouteComponentProps<any>> = ({
  location,
}) => {
  const qs = parseQs(location.search.substr(1));
  const params: SalesRepresentativeListUrlQueryParams = qs as any;
  
  return <SalesRepresentativeList params={params} />;
};

const SalesRepresentativeUpdateView: React.FC<
  RouteComponentProps<{ id: string }>
> = ({ match, location }) => {
  const qs = parseQs(location.search.substr(1));
  const params: SalesRepresentativeUrlQueryParams = qs as any;
  
  return (
    <SalesRepresentativeUpdate
      id={decodeURIComponent(match.params.id)}
      params={params}
    />
  );
};

const SalesRepresentativeCreateView: React.FC = () => {
  return <SalesRepresentativeCreate />;
};

const SalesRepresentativeSection: React.FC = () => (
  <>
    <WindowTitle title={"담당자 관리"} />
    <Switch>
      <Route
        exact
        path={salesRepresentativeListPath}
        component={SalesRepresentativeListView}
      />
      <Route
        exact
        path={salesRepresentativeAddPath}
        component={SalesRepresentativeCreateView}
      />
      <Route path={salesRepresentativePath(":id")} component={SalesRepresentativeUpdateView} />
    </Switch>
  </>
);

export default SalesRepresentativeSection;