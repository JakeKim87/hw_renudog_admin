// src/popups/index.tsx

import { asSortParams } from "@dashboard/utils/sort";
import { parse as parseQs } from "qs";
import React from "react";
import { Route, RouteComponentProps, Switch } from "react-router-dom";

import { WindowTitle } from "../components/WindowTitle";
import {
  popupAddPath,
  popupListPath,
  PopupListUrlQueryParams,
  PopupListUrlSortField,
  popupPath,
  PopupUrlQueryParams,
} from "./urls";
import PopupCreate from "./views/PopupCreate";
import PopupList from "./views/PopupList";
import PopupUpdate from "./views/PopupUpdate";

const PopupListView: React.FC<RouteComponentProps<any>> = ({ location }) => {
  const qs = parseQs(location.search.substr(1)) as any;
  const params: PopupListUrlQueryParams = asSortParams(
    qs,
    PopupListUrlSortField,
    PopupListUrlSortField.createdAt,
    false,
  );

  return <PopupList params={params} />;
};

const PopupUpdateView: React.FC<RouteComponentProps<{ id: string }>> = ({ match, location }) => {
  const qs = parseQs(location.search.substr(1));
  const params: PopupUrlQueryParams = qs as any;

  return <PopupUpdate id={decodeURIComponent(match.params.id)} params={params} />;
};

const PopupCreateView: React.FC = () => {
  return <PopupCreate />;
};

const PopupSection: React.FC = () => {
  return (
    <>
      <WindowTitle title={"팝업 관리"} />
      <Switch>
        <Route exact path={popupListPath} component={PopupListView} />
        <Route exact path={popupAddPath} component={PopupCreateView} />
        <Route path={popupPath(":id")} component={PopupUpdateView} />
      </Switch>
    </>
  );
};

export default PopupSection;