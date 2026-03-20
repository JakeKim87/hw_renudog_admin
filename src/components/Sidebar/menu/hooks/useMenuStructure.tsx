import {
  pendingAgencyTransfersUrl,
  processedAgencyTransfersUrl,
} from "@dashboard/agency-transfers/urls";
import { SidebarAppAlert } from "@dashboard/apps/components/AppAlerts/SidebarAppAlert";
import { useAppsAlert } from "@dashboard/apps/components/AppAlerts/useAppsAlert";
import { AppPaths } from "@dashboard/apps/urls";
import { useUser } from "@dashboard/auth";
import { categoryListUrl } from "@dashboard/categories/urls";
import { collectionListUrl } from "@dashboard/collections/urls";
import { configurationMenuUrl } from "@dashboard/configuration";
import { getConfigMenuItemsPermissions } from "@dashboard/configuration/utils";
import { customerListUrl } from "@dashboard/customers/urls";
import { depositHistoryListUrl } from "@dashboard/depositHistory/urls";
import { saleListUrl, voucherListUrl } from "@dashboard/discounts/urls";
import { eventListUrl, eventSubmissionListUrl } from "@dashboard/events/urls";
import { extensionMountPoints } from "@dashboard/extensions/extensionMountPoints";
import { useExtensions } from "@dashboard/extensions/hooks/useExtensions";
import {
  extensionsAppSection,
  extensionsCustomSection,
  ExtensionsPaths,
  extensionsPluginSection,
} from "@dashboard/extensions/urls";
import { faqListUrl } from "@dashboard/faq/urls";
import { useFlag } from "@dashboard/featureFlags";
import { giftCardListUrl } from "@dashboard/giftCards/urls";
import { PermissionEnum } from "@dashboard/graphql";
import { ConfigurationIcon } from "@dashboard/icons/Configuration";
import { CustomersIcon } from "@dashboard/icons/Customers";
import { DiscountsIcon } from "@dashboard/icons/Discounts";
import EventIcon from "@dashboard/icons/EventIcon";
import { FaqIcon } from "@dashboard/icons/FaqIcon";
import { HomeIcon } from "@dashboard/icons/Home";
import { MarketplaceIcon } from "@dashboard/icons/Marketplace";
import ModelingIcon from "@dashboard/icons/Modeling";
import NoticeIcon from "@dashboard/icons/NoticeIcon";
import { OrdersIcon } from "@dashboard/icons/Orders";
import PopupIcon from "@dashboard/icons/PopupIcon";
import { ProductsIcon } from "@dashboard/icons/Products";
import SalesRepresentativeIcon from "@dashboard/icons/SalesRepresentativeIcon";
import TierIcon from "@dashboard/icons/TierIcon";
import { TokenSaleIcon } from "@dashboard/icons/TokenSaleIcon";
import { TranslationsIcon } from "@dashboard/icons/Translations";
import { commonMessages, sectionNames } from "@dashboard/intl";
import { membershipTierListUrl } from "@dashboard/membershipTiers/urls";
import { pageListPath } from "@dashboard/modeling/urls";
import { pageTypeListUrl } from "@dashboard/modelTypes/urls";
import { noticeListUrl } from "@dashboard/notices/urls";
import {
  deliveredOrderListUrl,
  inTransitOrderListUrl,
  orderDraftListUrl,
  orderListUrl,
  preparingOrderListUrl,
  unfulfilledOrderListUrl,
} from "@dashboard/orders/urls";
import { pointHistoryListUrl } from "@dashboard/pointHistory/urls";
import { popupListUrl } from "@dashboard/popups/urls";
import { productListUrl } from "@dashboard/products/urls";
import { salesRepresentativeListUrl } from "@dashboard/salesRepresentatives/urls";
import { SearchShortcut } from "@dashboard/search/SearchShortcut";
import { menuListUrl } from "@dashboard/structures/urls";
import { tokenSaleUrl } from "@dashboard/tokenSale/urls";
import { languageListUrl } from "@dashboard/translations/urls";
import { inventoryListUrl } from "@dashboard/warehouses/urls";
import { LocalShippingOutlined } from "@material-ui/icons";
import { Box, SearchIcon } from "@saleor/macaw-ui-next";
import isEmpty from "lodash/isEmpty";
import React from "react";
import { useIntl } from "react-intl";

import { SidebarMenuItem } from "../types";
import { mapToExtensionsItems } from "../utils";

export function useMenuStructure() {
  const { enabled: hasAppAlertsFeatureFlag } = useFlag("app_alerts");
  const { handleAppsListItemClick, hasNewFailedAttempts } = useAppsAlert(hasAppAlertsFeatureFlag);

  const extensions = useExtensions(extensionMountPoints.NAVIGATION_SIDEBAR);
  const intl = useIntl();
  const { user } = useUser();
  const { enabled: showExtensions } = useFlag("extensions");

  const appExtensionsHeaderItem: SidebarMenuItem = {
    id: "extensions",
    label: intl.formatMessage(sectionNames.appExtensions),
    type: "divider",
    paddingY: 1.5,
  };
  const getAppSection = (): SidebarMenuItem => ({
    icon: renderIcon(<MarketplaceIcon />),
    label: intl.formatMessage(sectionNames.apps),
    permissions: [],
    id: "apps",
    url: AppPaths.appListPath,
    type: "item",
    endAdornment: hasAppAlertsFeatureFlag ? (
      <SidebarAppAlert hasNewFailedAttempts={hasNewFailedAttempts} />
    ) : null,
    onClick: () => handleAppsListItemClick(new Date().toISOString()),
  });

  const getExtensionsSection = (): SidebarMenuItem => ({
    icon: renderIcon(<MarketplaceIcon />),
    label: intl.formatMessage(sectionNames.extensions),
    permissions: [],
    id: "installed-extensions",
    url: ExtensionsPaths.installedExtensions,
    type: "itemGroup",
    endAdornment: hasAppAlertsFeatureFlag ? (
      <SidebarAppAlert hasNewFailedAttempts={hasNewFailedAttempts} />
    ) : null,
    onClick: () => handleAppsListItemClick(new Date().toISOString()),
    children: [
      {
        label: (
          <Box display="flex" alignItems="center" gap={3}>
            {intl.formatMessage(sectionNames.installedExtensions)}
            {hasAppAlertsFeatureFlag && (
              <SidebarAppAlert hasNewFailedAttempts={hasNewFailedAttempts} small />
            )}
          </Box>
        ),
        id: "installed-extensions",
        url: ExtensionsPaths.installedExtensions,
        matchUrls: [
          ExtensionsPaths.installedExtensions,
          extensionsCustomSection,
          extensionsAppSection,
          extensionsPluginSection,
        ],
        permissions: [],
        type: "item",
      },
      {
        label: intl.formatMessage(sectionNames.exploreExtensions),
        id: "explore-extensions",
        url: ExtensionsPaths.exploreExtensions,
        permissions: [],
        type: "item",
      },
    ],
  });

  const menuItems: SidebarMenuItem[] = [
    {
      icon: renderIcon(<HomeIcon />),
      label: intl.formatMessage(sectionNames.home),
      id: "home",
      url: "/",
      type: "item",
    },
    // {
    //   icon: renderIcon(<TokenSaleIcon />),
    //   label: "토큰관리",
    //   id: "token",
    //   url: tokenSaleUrl(),
    //   type: "item",
    // },
    // {
    //   icon: renderIcon(<SearchIcon />),
    //   label: (
    //     <Box display="flex" alignItems="center" gap={2}>
    //       {intl.formatMessage(sectionNames.search)}
    //       <SearchShortcut />
    //     </Box>
    //   ),
    //   id: "search",
    //   url: "/search",
    //   permissions: [
    //     PermissionEnum.MANAGE_PRODUCTS,
    //     PermissionEnum.MANAGE_PAGES,
    //     PermissionEnum.MANAGE_PAGE_TYPES_AND_ATTRIBUTES,
    //     PermissionEnum.MANAGE_ORDERS,
    //   ],
    //   type: "item",
    // },
    {
      children: [
        {
          label: intl.formatMessage(sectionNames.products),
          id: "products",
          url: productListUrl(),
          permissions: [PermissionEnum.MANAGE_PRODUCTS],
          type: "item",
        },
        {
          label: intl.formatMessage(sectionNames.categories),
          id: "categories",
          url: categoryListUrl(),
          permissions: [PermissionEnum.MANAGE_PRODUCTS],
          type: "item",
        },
        {
          label: "재고 현황",
          id: "inventory",
          url: inventoryListUrl(),
          permissions: [PermissionEnum.MANAGE_PRODUCTS], // 상품 관리 권한 필요
          type: "item",
        },
        // {
        //   label: intl.formatMessage(sectionNames.collections),
        //   id: "collections",
        //   url: collectionListUrl(),
        //   permissions: [PermissionEnum.MANAGE_PRODUCTS],
        //   type: "item",
        // },
        // {
        //   label: intl.formatMessage(sectionNames.giftCards),
        //   id: "giftCards",
        //   url: giftCardListUrl(),
        //   permissions: [PermissionEnum.MANAGE_GIFT_CARD],
        //   type: "item",
        // },
        ...mapToExtensionsItems(
          extensions.NAVIGATION_CATALOG,
          appExtensionsHeaderItem,
          showExtensions,
        ),
      ],
      icon: renderIcon(<ProductsIcon />),
      url: productListUrl(),
      label: "상품관리",
      permissions: [PermissionEnum.MANAGE_GIFT_CARD, PermissionEnum.MANAGE_PRODUCTS],
      id: "products",
      type: "itemGroup",
    },
    {
      children: [
        {
          label: intl.formatMessage(sectionNames.orders),
          permissions: [PermissionEnum.MANAGE_ORDERS],
          id: "orders",
          url: orderListUrl(),
          type: "item",
        },
        {
          label: "미처리 주문", // 메뉴에 표시될 이름
          permissions: [PermissionEnum.MANAGE_ORDERS],
          id: "unfulfilled-orders",
          url: unfulfilledOrderListUrl(),
          type: "item",
        },
        {
          label: "배송 준비중 주문",
          permissions: [PermissionEnum.MANAGE_ORDERS],
          id: "preparing-orders",
          url: preparingOrderListUrl(),
          type: "item",
        },
        {
          label: "배송중 주문",
          permissions: [PermissionEnum.MANAGE_ORDERS],
          id: "in-transit-orders",
          url: inTransitOrderListUrl(),
          type: "item",
        },
        {
          label: "배송 완료 주문",
          permissions: [PermissionEnum.MANAGE_ORDERS],
          id: "delivered-orders",
          url: deliveredOrderListUrl(),
          type: "item",
        },
        // {
        //   label: intl.formatMessage(sectionNames.draftOrders),
        //   permissions: [PermissionEnum.MANAGE_ORDERS],
        //   id: "order-drafts",
        //   url: orderDraftListUrl(),
        //   type: "item",
        // },
        ...mapToExtensionsItems(
          extensions.NAVIGATION_ORDERS,
          appExtensionsHeaderItem,
          showExtensions,
        ),
      ],
      icon: renderIcon(<OrdersIcon />),
      label: intl.formatMessage(sectionNames.fulfillment),
      permissions: [PermissionEnum.MANAGE_ORDERS],
      id: "orders",
      url: orderListUrl(),
      type: "itemGroup",
    },
    // {
    //   id: "agency-transfers",
    //   label: "대리점 출고 관리",
    //   icon: <LocalShippingOutlined />, // 예시 아이콘, 적절한 아이콘으로 변경
    //   url: pendingAgencyTransfersUrl(),
    //   type: "itemGroup",
    //   children: [
    //     {
    //       id: "agency-transfers-pending",
    //       label: "신규 출고 요청",
    //       url: pendingAgencyTransfersUrl(),
    //       type: "item",
    //     },
    //     {
    //       id: "agency-transfers-processed",
    //       label: "처리된 요청",
    //       url: processedAgencyTransfersUrl(),
    //       type: "item",
    //     },
    //   ],
    // },
    {
      children: [
        {
          label: intl.formatMessage(sectionNames.customers),
          permissions: [PermissionEnum.MANAGE_USERS],
          id: "customers",
          url: customerListUrl(),
          type: "item",
        },
        {
          label: "적립금 내역",
          permissions: [PermissionEnum.MANAGE_USERS],
          id: "point-history",
          url: pointHistoryListUrl(),
          type: "item",
        },
        {
          label: "예치금 내역",
          permissions: [PermissionEnum.MANAGE_USERS],
          id: "deposit-history",
          url: depositHistoryListUrl(),
          type: "item",
        },
        // {
        //   label: "회원등급 관리",
        //   permissions: [PermissionEnum.MANAGE_USERS],
        //   id: "membership-tiers",
        //   url: membershipTierListUrl(),
        //   type: "item",
        // },
        {
          // icon: renderIcon(<SalesRepresentativeIcon />),
          label: "고객사 담당자 관리",
          permissions: [PermissionEnum.MANAGE_USERS],
          id: "sales-representatives",
          url: salesRepresentativeListUrl(),
          type: "item",
        },
        ...mapToExtensionsItems(
          extensions.NAVIGATION_CUSTOMERS,
          appExtensionsHeaderItem,
          showExtensions,
        ),
      ],
      icon: renderIcon(<CustomersIcon />),
      label: "고객 관리",
      permissions: [PermissionEnum.MANAGE_USERS],
      id: "customers",
      url: customerListUrl(),
      type: "itemGroup",
    },
    // {
    //   icon: renderIcon(<TierIcon />), // 3. FaqIcon 사용
    //   label: "회원등급",
    //   permissions: [PermissionEnum.MANAGE_PAGES], // 4. 권한 설정
    //   id: "membership-tiers",
    //   url: membershipTierListUrl(),
    //   type: "item", // 5. 'itemGroup'이 아닌 'item'으로 설정
    // },
    // {
    //   icon: renderIcon(<SalesRepresentativeIcon />), // 3. FaqIcon 사용
    //   label: "고객사 담당자 관리",
    //   permissions: [PermissionEnum.MANAGE_PAGES], // 4. 권한 설정
    //   id: "sales-representatives",
    //   url: salesRepresentativeListUrl(),
    //   type: "item", // 5. 'itemGroup'이 아닌 'item'으로 설정
    // },
    // {
    //   id: "events",
    //   label: "이벤트 관리",
    //   type: "itemGroup",
    //   url: eventListUrl(),
    //   icon: renderIcon(<EventIcon />),
    //   permissions: [PermissionEnum.MANAGE_PAGES],
    //   children: [
    //     {
    //       id: "event-list",
    //       label: "이벤트 목록",
    //       url: eventListUrl(),
    //       permissions: [PermissionEnum.MANAGE_PAGES],
    //       type: "item",
    //     },
    //     {
    //       id: "event-submissions",
    //       label: "제출 내역",
    //       url: eventSubmissionListUrl(),
    //       permissions: [PermissionEnum.MANAGE_PAGES],
    //       type: "item",
    //     },
    //   ],
    // },
    {
      icon: renderIcon(<FaqIcon />),
      label: "FAQ",
      permissions: [PermissionEnum.MANAGE_PAGES],
      id: "faq",
      url: faqListUrl(),
      type: "item",
    },
    {
      icon: renderIcon(<NoticeIcon />),
      label: "공지사항",
      permissions: [PermissionEnum.MANAGE_PAGES],
      id: "notices",
      url: noticeListUrl(),
      type: "item",
    },
    {
      icon: renderIcon(<PopupIcon />),
      label: "팝업 관리",
      permissions: [PermissionEnum.MANAGE_PAGES],
      id: "popups",
      url: popupListUrl(),
      type: "item",
    },
    {
      children: [
        {
          label: intl.formatMessage(sectionNames.vouchers),
          id: "vouchers",
          url: voucherListUrl(),
          type: "item",
        },
        {
          label: intl.formatMessage(sectionNames.promotions),
          id: "promotions",
          url: saleListUrl(),
          type: "item",
        },
        ...mapToExtensionsItems(
          extensions.NAVIGATION_DISCOUNTS,
          appExtensionsHeaderItem,
          showExtensions,
        ),
      ],
      icon: renderIcon(<DiscountsIcon />),
      label: intl.formatMessage(commonMessages.discounts),
      permissions: [PermissionEnum.MANAGE_DISCOUNTS],
      url: voucherListUrl(),
      id: "discounts",
      type: "itemGroup",
    },
    // {
    //   children: [
    //     {
    //       label: intl.formatMessage(sectionNames.models),
    //       id: "models",
    //       url: pageListPath,
    //       permissions: [PermissionEnum.MANAGE_PAGES],
    //       type: "item",
    //     },
    //     {
    //       label: intl.formatMessage(sectionNames.modelTypes),
    //       id: "model-types",
    //       url: pageTypeListUrl(),
    //       permissions: [
    //         PermissionEnum.MANAGE_PAGES,
    //         PermissionEnum.MANAGE_PAGE_TYPES_AND_ATTRIBUTES,
    //       ],
    //       type: "item",
    //     },
    //     {
    //       label: intl.formatMessage(sectionNames.structures),
    //       id: "structures",
    //       url: menuListUrl(),
    //       permissions: [PermissionEnum.MANAGE_MENUS],
    //       type: "item",
    //     },
    //     ...mapToExtensionsItems(
    //       extensions.NAVIGATION_PAGES,
    //       appExtensionsHeaderItem,
    //       showExtensions,
    //     ),
    //   ],
    //   icon: renderIcon(<ModelingIcon />),
    //   label: intl.formatMessage(sectionNames.modeling),
    //   permissions: [PermissionEnum.MANAGE_PAGES, PermissionEnum.MANAGE_MENUS],
    //   id: "modeling",
    //   url: pageListPath,
    //   type: "itemGroup",
    // },
    {
      icon: renderIcon(<ModelingIcon />),
      label: "메뉴설정",
      id: "structures",
      url: menuListUrl(),
      permissions: [PermissionEnum.MANAGE_MENUS],
      type: "item",
    },
    // {
    //   children: !isEmpty(extensions.NAVIGATION_TRANSLATIONS)
    //     ? [
    //         ...mapToExtensionsItems(
    //           extensions.NAVIGATION_TRANSLATIONS,
    //           appExtensionsHeaderItem,
    //           showExtensions,
    //         ),
    //       ]
    //     : undefined,
    //   icon: renderIcon(<TranslationsIcon />),
    //   label: intl.formatMessage(sectionNames.translations),
    //   permissions: [PermissionEnum.MANAGE_TRANSLATIONS],
    //   id: "translations",
    //   url: languageListUrl,
    //   type: !isEmpty(extensions.NAVIGATION_TRANSLATIONS) ? "itemGroup" : "item",
    // },
    // showExtensions ? getExtensionsSection() : getAppSection(),
    {
      icon: renderIcon(<ConfigurationIcon />),
      label: intl.formatMessage(sectionNames.configuration),
      permissions: getConfigMenuItemsPermissions(intl),
      id: "configure",
      url: configurationMenuUrl,
      type: "item",
    },
  ];
  const isMenuItemPermitted = (menuItem: SidebarMenuItem) => {
    const userPermissions = (user?.userPermissions || []).map(permission => permission.code);

    if (!menuItem?.permissions || menuItem?.permissions?.length < 1) {
      return true;
    }

    return menuItem.permissions.some(permission => userPermissions.includes(permission));
  };
  const getFilteredMenuItems = (menuItems: SidebarMenuItem[]) =>
    menuItems.filter(isMenuItemPermitted);

  return menuItems.reduce((resultItems: SidebarMenuItem[], menuItem: SidebarMenuItem) => {
    if (!isMenuItemPermitted(menuItem)) {
      return resultItems;
    }

    const { children } = menuItem;
    const filteredChildren = children ? getFilteredMenuItems(children) : undefined;

    return [...resultItems, { ...menuItem, children: filteredChildren }];
  }, []);
}

function renderIcon(icon: React.ReactNode) {
  return (
    <Box color="default2" __width={20} __height={20}>
      {icon}
    </Box>
  );
}
