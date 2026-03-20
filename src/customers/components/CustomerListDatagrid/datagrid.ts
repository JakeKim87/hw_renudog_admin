import { pillCell, readonlyTextCell } from "@dashboard/components/Datagrid/customCells/cells";
import { AvailableColumn } from "@dashboard/components/Datagrid/types";
import { CustomerListUrlSortField } from "@dashboard/customers/urls";
import { type CustomerFragment } from "@dashboard/graphql";
import { getStatusColor, transformIsActiveStatus } from "@dashboard/misc";
import { Sort } from "@dashboard/types";
import { getColumnSortDirectionIcon } from "@dashboard/utils/columns/getColumnSortDirectionIcon";
import { GridCell, Item } from "@glideapps/glide-data-grid";
import { DefaultTheme } from "@saleor/macaw-ui-next";

export const customerListStaticColumnsAdapter = (
  sort: Sort<CustomerListUrlSortField>,
): AvailableColumn[] =>
  [
    {
      id: "businessName",
      title: "병원명",
      width: 350,
    },
    {
      id: "representativeName",
      title: "대표원장",
      width: 200,
    },
    {
      id: "businessPhone",
      title: "병원전화번호",
      width: 250,
    },
    {
      id: "email",
      title: "이메일",
      width: 350,
    },
    {
      id: "membershipTier",
      title: "회원 등급",
      width: 150,
    },
    {
      id: "isActive",
      title: "활성화 여부",
      width: 150,
    },
  ].map(column => ({
    ...column,
    icon: getColumnSortDirectionIcon(sort, column.id),
  }));

export const createGetCellContent =
  ({
    customers,
    columns,
    theme, // ✅ 추가
  }: {
    customers: readonly CustomerFragment[] | undefined;
    columns: AvailableColumn[];
    theme: DefaultTheme; // ✅ 추가
  }) =>
  ([column, row]: Item): GridCell => {
    const rowData = customers?.[row];
    const columnId = columns[column]?.id;

    if (!columnId || !rowData) {
      return readonlyTextCell("");
    }

    switch (columnId) {
      case "businessName":
        // `rowData.businessName`이 null 또는 undefined일 수 있으므로 `?? ""`를 사용합니다.
        return readonlyTextCell(rowData.businessName ?? "");
      case "representativeName":
        return readonlyTextCell(rowData.representativeName ?? "");
      case "businessPhone":
        return readonlyTextCell(rowData.businessPhone ?? "");
      case "email":
        // email은 필수값이지만, 안전을 위해 `?? ""`를 사용합니다.
        return readonlyTextCell(rowData.email ?? "");
      case "membershipTier":
        return readonlyTextCell(rowData?.membership?.tier?.grade ?? "-");
      case "isActive": {
        const transformedStatus = transformIsActiveStatus(rowData.isActive);

        if (transformedStatus) {
          const color = getStatusColor({
            status: transformedStatus.status,
            currentTheme: theme,
          });

          return pillCell(transformedStatus.localized, color);
        }

        return readonlyTextCell("");
      }
      default:
        return readonlyTextCell("");
    }
  };