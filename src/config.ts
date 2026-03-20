import packageInfo from "../package.json";
import { SearchVariables } from "./hooks/makeSearch";
import { ListSettings, ListViews, Pagination } from "./types";

export const getAppDefaultUri = () => "/";
export const getAppMountUri = () => window?.__SALEOR_CONFIG__?.APP_MOUNT_URI || getAppDefaultUri();
export const getApiUrl = () => window.__SALEOR_CONFIG__.API_URL;
export const SW_INTERVAL = parseInt(process.env.SW_INTERVAL ?? "300", 10);
export const IS_CLOUD_INSTANCE = window.__SALEOR_CONFIG__.IS_CLOUD_INSTANCE === "true";

export const getAppsConfig = () => ({
  marketplaceApiUri: window.__SALEOR_CONFIG__.APPS_MARKETPLACE_API_URL,
  tunnelUrlKeywords: window.__SALEOR_CONFIG__.APPS_TUNNEL_URL_KEYWORDS?.split(";") || [
    ".ngrok.io",
    ".saleor.live",
    ".trycloudflare.com",
  ],
});

export const getExtensionsConfig = () => ({
  extensionsApiUri: window.__SALEOR_CONFIG__.EXTENSIONS_API_URL,
});

export const DEFAULT_INITIAL_SEARCH_DATA: SearchVariables = {
  after: null,
  first: 20,
  query: "",
};

export const DEFAULT_INITIAL_PAGINATION_DATA: Pagination = {
  after: undefined,
  before: undefined,
};

export const PAGINATE_BY = 100;
export const VALUES_PAGINATE_BY = 10;

export type ProductListColumns =
  | "name"
  | "productType"
  | "description"
  | "availability"
  | "price"
  | "date"
  | "created"
  | "productCategory"
  | "productCollections";

export interface AppListViewSettings {
  [ListViews.APPS_LIST]: ListSettings;
  [ListViews.ATTRIBUTE_VALUE_LIST]: ListSettings;
  [ListViews.ATTRIBUTE_LIST]: ListSettings;
  [ListViews.CATEGORY_LIST]: ListSettings;
  [ListViews.COLLECTION_LIST]: ListSettings;
  [ListViews.CUSTOMER_LIST]: ListSettings;
  [ListViews.DRAFT_LIST]: ListSettings;
  [ListViews.NAVIGATION_LIST]: ListSettings;
  [ListViews.ORDER_LIST]: ListSettings;
  [ListViews.PAGES_LIST]: ListSettings;
  [ListViews.PLUGINS_LIST]: ListSettings;
  [ListViews.PRODUCT_LIST]: ListSettings<ProductListColumns>;
  [ListViews.SALES_LIST]: ListSettings;
  [ListViews.DISCOUNTS_LIST]: ListSettings;
  [ListViews.SHIPPING_METHODS_LIST]: ListSettings;
  [ListViews.STAFF_MEMBERS_LIST]: ListSettings;
  [ListViews.PERMISSION_GROUP_LIST]: ListSettings;
  [ListViews.VOUCHER_LIST]: ListSettings;
  [ListViews.WAREHOUSE_LIST]: ListSettings;
  [ListViews.WEBHOOK_LIST]: ListSettings;
  [ListViews.TRANSLATION_ATTRIBUTE_VALUE_LIST]: ListSettings;
  [ListViews.GIFT_CARD_LIST]: ListSettings;
  [ListViews.ORDER_DETAILS_LIST]: ListSettings;
  [ListViews.ORDER_DRAFT_DETAILS_LIST]: ListSettings;
  [ListViews.PRODUCT_DETAILS]: ListSettings;
  [ListViews.VOUCHER_CODES]: ListSettings;
  [ListViews.ORDER_REFUNDS]: ListSettings;
  [ListViews.ORDER_TRANSACTION_REFUNDS]: ListSettings;
  [ListViews.FAQ_LIST]: ListSettings;
  [ListViews.MEMBERSHIP_TIER_LIST]: ListSettings;
  [ListViews.NOTICE_LIST]: ListSettings;
  [ListViews.SALES_REPRESENTATIVE_LIST]: ListSettings;
  [ListViews.STOCK_LIST]: ListSettings;
  [ListViews.POPUP_LIST]: ListSettings;
  [ListViews.EVENT_LIST]: ListSettings;
  [ListViews.EVENT_SUBMISSION_LIST]: ListSettings;
  [ListViews.POINT_HISTORY_LIST]: ListSettings;
  [ListViews.DEPOSIT_HISTORY_LIST]: ListSettings;
  [ListViews.AGENCY_TRANSFER_LIST]: ListSettings;
}
// TODO: replace with
// type AppListViewSettings = Record<ListViews, ListSettings>;

export const defaultListSettings: AppListViewSettings = {
  [ListViews.APPS_LIST]: {
    rowNumber: 100,
  },
  [ListViews.ATTRIBUTE_VALUE_LIST]: {
    rowNumber: 10,
  },
  [ListViews.ATTRIBUTE_LIST]: {
    rowNumber: 10,
    columns: ["slug", "name", "visible", "searchable", "use-in-faceted-search"],
  },
  [ListViews.CATEGORY_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["name", "products", "subcategories"],
  },
  [ListViews.COLLECTION_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["name", "productCount", "availability"],
  },
  [ListViews.CUSTOMER_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["businessName", "representativeName", "businessPhone", "email", "isActive"],
  },
  [ListViews.DRAFT_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["number", "date", "customer", "total"],
  },
  [ListViews.NAVIGATION_LIST]: {
    rowNumber: PAGINATE_BY,
  },
  [ListViews.ORDER_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["number", "date", "customer", "payment", "status", "paidDate", "total", "quantity"],
  },
  [ListViews.PAGES_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["title", "slug", "visible"],
  },
  [ListViews.PLUGINS_LIST]: {
    rowNumber: PAGINATE_BY,
  },
  [ListViews.PRODUCT_LIST]: {
    columns: ["name", "price", "date", "created"],
    rowNumber: PAGINATE_BY,
  },
  [ListViews.SALES_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["name", "startDate", "endDate", "value"],
  },
  [ListViews.DISCOUNTS_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["name", "type", "startDate", "endDate"],
  },
  [ListViews.SHIPPING_METHODS_LIST]: {
    columns: ["name", "countries"],
    rowNumber: PAGINATE_BY,
  },
  [ListViews.STAFF_MEMBERS_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["name", "email", "status"],
  },
  [ListViews.PERMISSION_GROUP_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["name", "members"],
  },
  [ListViews.VOUCHER_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["code", "rewardType", "value", "min-spent", "start-date", "end-date", "limit"],
  },

  [ListViews.WAREHOUSE_LIST]: {
    rowNumber: PAGINATE_BY,
  },
  [ListViews.WEBHOOK_LIST]: {
    rowNumber: PAGINATE_BY,
  },
  [ListViews.TRANSLATION_ATTRIBUTE_VALUE_LIST]: {
    rowNumber: 10,
  },
  [ListViews.GIFT_CARD_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["giftCardCode", "status", "tag", "product", "usedBy", "balance"],
  },
  [ListViews.ORDER_DETAILS_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: [
      "product",
      "cancel",
      "sku",
      "variantName",
      "quantity",
      "additionalOptions",
      "price",
      "total",
    ],
  },
  [ListViews.ORDER_DRAFT_DETAILS_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["product", "status", "sku", "variantName", "quantity", "price", "total"],
  },
  [ListViews.PRODUCT_DETAILS]: {
    rowNumber: PAGINATE_BY,
    columns: ["name", "sku"],
  },
  [ListViews.VOUCHER_CODES]: {
    rowNumber: PAGINATE_BY,
  },
  [ListViews.ORDER_REFUNDS]: {
    rowNumber: PAGINATE_BY,
    columns: ["status", "amount", "reason", "date", "account"],
  },
  [ListViews.ORDER_TRANSACTION_REFUNDS]: {
    rowNumber: PAGINATE_BY,
    columns: ["product", "unitPrice", "qtyOrdered", "maxQty", "qtyToRefund", "reason"],
  },
  [ListViews.FAQ_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["title", "author", "createdAt", "viewCount"],
  },
  [ListViews.MEMBERSHIP_TIER_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["grade", "withoutQ", "withQ", "preserve", "earningRate"],
  },
  [ListViews.NOTICE_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["title", "author", "createdAt", "viewCount"],
  },
  [ListViews.SALES_REPRESENTATIVE_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["name", "phoneNumber", "email"],
  },
  [ListViews.STOCK_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["product", "sku", "quantity", "available"],
  },
  [ListViews.POPUP_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["title", "isActive", "displayPage", "startDate", "endDate"],
  },
  [ListViews.EVENT_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["title", "isActive", "startDate", "endDate", "pointMultiplier"],
  },
  [ListViews.EVENT_SUBMISSION_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["businessName", "contentType", "status", "submittedAt", "approvedPoints"],
  },
  [ListViews.POINT_HISTORY_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["date", "hospital", "type", "points", "balanceAfterTransaction", "reason"],
  },
  [ListViews.DEPOSIT_HISTORY_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["date", "hospital", "type", "amount", "balanceAfterTransaction", "reason"],
  },
  [ListViews.AGENCY_TRANSFER_LIST]: {
    rowNumber: PAGINATE_BY,
    columns: ["number", "agency", "createdAt", "status", "products", "recipient"],
  },
};

export const APP_VERSION = process.env.CUSTOM_VERSION || `v${packageInfo.version}`;

export const DEMO_MODE = process.env.DEMO_MODE === "true";
export const GTM_ID = process.env.GTM_ID;

export const DEFAULT_NOTIFICATION_SHOW_TIME = 3000;
export const ENABLED_SERVICE_NAME_HEADER =
  (process.env.ENABLED_SERVICE_NAME_HEADER as string) === "true";
