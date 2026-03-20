// @ts-strict-ignore
import appleIcon from "@assets/favicons/apple-icon.png";
import icon from "@assets/favicons/icon.png";
import { useUser } from "@dashboard/auth";
import { ShopInfoQuery, useShopInfoQuery } from "@dashboard/graphql";
import React, { PropsWithChildren, useEffect } from "react";
import Helmet from "react-helmet";

import { useAnalytics } from "../ProductAnalytics/useAnalytics";
import { extractEmailDomain } from "../ProductAnalytics/utils";

type ShopContext = ShopInfoQuery["shop"];

export const ShopContext = React.createContext<ShopContext>(undefined);

export const ShopProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { authenticated, user } = useUser();
  const analytics = useAnalytics();
  const { data } = useShopInfoQuery({
    skip: !authenticated || !user,
  });

  useEffect(() => {
    if (data) {
      const { shop } = data;

      analytics.initialize({
        domain: shop.domain.host,
        email_domain: extractEmailDomain(user.email),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <>
      <Helmet>
        <link rel="apple-touch-icon" sizes="72x72" href={appleIcon} />
        <link rel="icon" type="image/png" sizes="72x72" href={icon} />
        <link rel="mask-icon" href={icon} />
      </Helmet>
      <ShopContext.Provider value={data ? data.shop : undefined}>{children}</ShopContext.Provider>
    </>
  );
};

export const Shop = ShopContext.Consumer;
export default Shop;
