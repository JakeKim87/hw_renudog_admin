import { CategoryListUrlSortField } from "@dashboard/categories/urls";
import { readonlyTextCell } from "@dashboard/components/Datagrid/customCells/cells";
import { AvailableColumn } from "@dashboard/components/Datagrid/types";
import { CategoryFragment } from "@dashboard/graphql";
import { Sort } from "@dashboard/types";
import { getColumnSortDirectionIcon } from "@dashboard/utils/columns/getColumnSortDirectionIcon";
import { GridCell, Item } from "@glideapps/glide-data-grid";

export const categoryListStaticColumnsAdapter = (
  sort?: Sort<CategoryListUrlSortField>,
): AvailableColumn[] =>
  [
    {
      id: "name",
      title: "카테고리",
      width: 350,
    },
    {
      id: "subcategories",
      title: "하위 카테고리",
      width: 300,
    },
    {
      id: "products",
      title: "상품수",
      width: 300,
    },
  ].map(column => ({
    ...column,
    icon: sort ? getColumnSortDirectionIcon(sort, column.id) : undefined,
  }));

export const createGetCellContent =
  (categories: CategoryFragment[], columns: AvailableColumn[]) =>
  ([column, row]: Item): GridCell => {
    const columnId = columns[column]?.id;
    const rowData: CategoryFragment | undefined = categories[row];

    if (!columnId || !rowData) {
      return readonlyTextCell("");
    }

    switch (columnId) {
      case "name":
        return readonlyTextCell(rowData?.name ?? "");
      case "subcategories":
        return readonlyTextCell(rowData?.children?.totalCount?.toString() ?? "");
      case "products":
        return readonlyTextCell(rowData?.products?.totalCount?.toString() ?? "");
      default:
        return readonlyTextCell("", false);
    }
  };
