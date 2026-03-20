// src/tokenSale/index.tsx

import React from "react";
import { Route, Switch } from "react-router-dom";

import { WindowTitle } from "../components/WindowTitle";
import { tokenSalePath } from "./urls";
import TokenSaleManage from "./views/TokenSaleManage";

const TokenSaleSection: React.FC = () => {
  return (
    <>
      <WindowTitle title="토큰 판매 관리" />
      <Switch>
        <Route exact path={tokenSalePath} component={TokenSaleManage} />
      </Switch>
    </>
  );
};

export default TokenSaleSection;