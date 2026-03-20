// @ts-strict-ignore
import { IFilter } from "@dashboard/components/Filter";
import { hasPermissions } from "@dashboard/components/RequirePermissions";
import { UserFragment } from "@dashboard/graphql";
import { FilterOpts, MinMax } from "@dashboard/types";
import { createDateField } from "@dashboard/utils/filters/fields";
import { defineMessages, IntlShape } from "react-intl";

export enum CustomerFilterKeys {
  joined = "joined",
}

export interface CustomerListFilterOpts {
  joined: FilterOpts<MinMax>;
  numberOfOrders: FilterOpts<MinMax>;
}

const messages = defineMessages({
  joinDate: {
    id: "icz/jb",
    defaultMessage: "Join Date",
    description: "customer",
  },
});

export function createFilterStructure(
  intl: IntlShape,
  opts: CustomerListFilterOpts,
  userPermissions: UserFragment["userPermissions"],
): IFilter<CustomerFilterKeys> {
  return [
    {
      ...createDateField(
        CustomerFilterKeys.joined,
        intl.formatMessage(messages.joinDate),
        opts.joined.value,
      ),
      active: opts.joined.active,
    },
  ].filter(filter => hasPermissions(userPermissions ?? [], filter.permissions ?? []));
}
