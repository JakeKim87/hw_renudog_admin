// src/membershipTiers/urls.ts
import { BulkAction, Dialog, SingleAction } from "@dashboard/types";
import { stringifyQs } from "@dashboard/utils/urls";
import urlJoin from "url-join";

const membershipTiersSection = "/membership-tiers/";

export const membershipTierListPath = membershipTiersSection;
export const membershipTierAddPath = urlJoin(membershipTiersSection, "add");
export const membershipTierPath = (id: string) => urlJoin(membershipTiersSection, id);

// --- 목록 페이지 URL ---
export type MembershipTierListUrlDialog = "delete";
export interface MembershipTierListUrlQueryParams
  extends BulkAction,
    Dialog<MembershipTierListUrlDialog> {}

export const membershipTierListUrl = (params?: MembershipTierListUrlQueryParams): string =>
  membershipTierListPath + "?" + stringifyQs(params);


// --- 생성 페이지 URL ---
// 👇 이 함수가 누락되었습니다. 다시 추가합니다.
export const membershipTierAddUrl = () => membershipTierAddPath;


// --- 상세/수정 페이지 URL ---
export type MembershipTierUrlDialog = "remove";
export type MembershipTierUrlQueryParams = Dialog<MembershipTierUrlDialog> & SingleAction;
export const membershipTierUrl = (id: string, params?: MembershipTierUrlQueryParams) =>
  membershipTierPath(encodeURIComponent(id)) + "?" + stringifyQs(params);