// src/inventory/index.tsx

import { parse as parseQs } from "qs";
import React from "react";
import { Route, RouteComponentProps, Switch } from "react-router-dom";

import { inventoryListUrl, InventoryListUrlQueryParams } from "../warehouses/urls";
import InventoryListComponent from "./views/InventoryList";

const InventoryList: React.FC<RouteComponentProps<any>> = ({ location }) => {
  const qs = parseQs(location.search.substr(1));

  return <InventoryListComponent params={qs as InventoryListUrlQueryParams} />;
};

// 이 섹션의 모든 라우팅을 관리하는 메인 컴포넌트입니다.
const InventorySection = () => (
  <Switch>
    {/* /inventory 경로로 정확히 일치하는 요청이 오면 InventoryList를 렌더링합니다. */}
    <Route exact path={inventoryListUrl()} component={InventoryList} />
  </Switch>
);

// ✅ 3. 이 파일을 import할 때 기본적으로 InventorySection을 내보냅니다.
export default InventorySection;