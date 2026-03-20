import { gql } from "@apollo/client";

export const warehouseList = gql`
  query WarehouseList(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $filter: WarehouseFilterInput
    $sort: WarehouseSortingInput
  ) {
    warehouses(
      before: $before
      after: $after
      first: $first
      last: $last
      filter: $filter
      sortBy: $sort
    ) {
      edges {
        node {
          ...WarehouseWithShipping
        }
      }
      pageInfo {
        ...PageInfo
      }
    }
  }
`;

export const warehouseDetails = gql`
  query WarehouseDetails($id: ID!) {
    warehouse(id: $id) {
      ...WarehouseDetails
    }
  }
`;

export const warehousesCount = gql`
  query WarehousesCount {
    warehouses {
      totalCount
    }
  }
`;

export const warehouseStockListQuery = gql`
  query WarehouseStockList(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $filter: StockFilterInput
    $sort: StockSortingInput
  ) {
    stocks(
      first: $first
      after: $after
      last: $last
      before: $before
      filter: $filter
      sortBy: $sort
    ) {
      edges {
        node {
          id
          quantity
          quantityAllocated
          productVariant {
            id
            name
            sku
            product {
              id
              name
            }
          }
          warehouse {
            id
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;
