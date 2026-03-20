// @ts-strict-ignore
import { useApolloClient } from "@apollo/client";
import { useUser } from "@dashboard/auth";
import ActionDialog from "@dashboard/components/ActionDialog";
import { WindowTitle } from "@dashboard/components/WindowTitle";
import {
  ListCustomersDocument,
  ListCustomersQuery,
  ListCustomersQueryVariables,
  PermissionEnum,
  useBulkRemoveCustomersMutation,
  useListCustomersQuery,
  useMembershipTiersQuery,
} from "@dashboard/graphql";
import useListSettings from "@dashboard/hooks/useListSettings";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import { usePaginationReset } from "@dashboard/hooks/usePaginationReset";
import usePaginator, {
  createPaginationState,
  PaginatorContext,
} from "@dashboard/hooks/usePaginator";
import { useRowSelection } from "@dashboard/hooks/useRowSelection";
import { commonMessages, sectionNames } from "@dashboard/intl";
import { ListViews } from "@dashboard/types";
import createDialogActionHandlers from "@dashboard/utils/handlers/dialogActionHandlers";
import createSortHandler from "@dashboard/utils/handlers/sortHandler";
import { mapEdgesToItems } from "@dashboard/utils/maps";
import { getSortParams } from "@dashboard/utils/sort";
import isEqual from "lodash/isEqual";
import moment from "moment";
import React, { useCallback, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import { FormattedMessage, useIntl } from "react-intl";

import CustomerListPage from "../../components/CustomerListPage";
import { customerListUrl, CustomerListUrlDialog, CustomerListUrlQueryParams } from "../../urls";
import { getFilterVariables } from "./filters";
import { getSortQueryVariables } from "./sort";

interface CustomerListProps {
  params: CustomerListUrlQueryParams;
}

export const CustomerList: React.FC<CustomerListProps> = ({ params }) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const intl = useIntl();
  const { user } = useUser();
  const { updateListSettings, settings } = useListSettings(ListViews.CUSTOMER_LIST);

  const hasManageOrdersPermission = user?.userPermissions?.some(
    perm => perm.code === PermissionEnum.MANAGE_ORDERS
  ) || false;

  usePaginationReset(customerListUrl, params, settings.rowNumber);

  const { clearRowSelection, selectedRowIds, setClearDatagridRowSelectionCallback, setSelectedRowIds } =
    useRowSelection(params);

  const paginationState = createPaginationState(settings.rowNumber, params);

  const queryVariables = React.useMemo(
    () => ({
      ...paginationState,
      filter: getFilterVariables(params),
      sort: getSortQueryVariables(params),
    }),
    [params, paginationState],
  );

  const { data: tiersData, loading: tiersLoading } = useMembershipTiersQuery();

  const { data, refetch } = useListCustomersQuery({
    displayLoader: true,
    variables: queryVariables,
  });

  const customers = mapEdgesToItems(data?.customers);
  const tiers = tiersData?.membershipTiers;

  const [openModal, closeModal] = createDialogActionHandlers<
    CustomerListUrlDialog,
    CustomerListUrlQueryParams
  >(navigate, customerListUrl, params);

  const paginationValues = usePaginator({
    pageInfo: data?.customers?.pageInfo,
    paginationState,
    queryString: params,
  });

  const [bulkRemoveCustomers, bulkRemoveCustomersOpts] = useBulkRemoveCustomersMutation({
    onCompleted: data => {
      if (data.customerBulkDelete?.errors.length === 0) {
        notify({
          status: "success",
          text: intl.formatMessage(commonMessages.savedChanges),
        });
        refetch();
        clearRowSelection();
        closeModal();
      }
    },
  });

  const handleSort = createSortHandler(navigate, customerListUrl, params);

  const handleSetSelectedCustomerIds = useCallback(
    (rows: number[], clearSelection: () => void) => {
      if (!customers) {
        return;
      }

      const rowsIds = rows.map(row => customers[row]?.id).filter(Boolean);

      if (!isEqual(rowsIds, selectedRowIds)) {
        setSelectedRowIds(rowsIds);
      }
      
      setClearDatagridRowSelectionCallback(clearSelection);
    },
    [customers, selectedRowIds, setClearDatagridRowSelectionCallback, setSelectedRowIds],
  );

  const client = useApolloClient();
  const [exportLoading, setExportLoading] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const csvLink = useRef<any>(null);

  const handleExport = async () => {
    setExportLoading(true);
    notify({ status: "info", text: "전체 고객 목록을 다운로드 중입니다..." });

    let allEdges = [];
    let hasNextPage = true;
    let endCursor = null;

    try {
      while (hasNextPage) {
        const { data: exportData } = await client.query<ListCustomersQuery, ListCustomersQueryVariables>({
          query: ListCustomersDocument,
          variables: {
            filter: getFilterVariables(params),
            sort: getSortQueryVariables(params),
            after: endCursor,
            first: 100,
            // 필수 변수 추가
            PERMISSION_MANAGE_ORDERS: hasManageOrdersPermission, 
          },
          fetchPolicy: "network-only",
        });


        if (exportData?.customers?.edges) {
          allEdges = [...allEdges, ...exportData.customers.edges];
          hasNextPage = exportData.customers.pageInfo.hasNextPage;
          endCursor = exportData.customers.pageInfo.endCursor;
        } else {
          hasNextPage = false;
        }
      }

      if (allEdges.length > 0) {
        const formattedData = allEdges.map(({ node }) => ({
          hospital: node.businessName,
          name: `${node.firstName} ${node.lastName}`.trim() || "-",
          email: node.email || "-",
          phone: node.businessPhone ? `\t${node.businessPhone.replace(/[-\s]/g, "")}` : "-",
          isActive: node.isActive ? "활성" : "비활성",
          tier: node.membership?.tier?.grade || "-", 
          dateJoined: moment(node.dateJoined).format("YYYY-MM-DD"),
        }));

        setCsvData(formattedData);
        setTimeout(() => {
          if (csvLink.current?.link) {
            csvLink.current.link.click();
          }
          setCsvData([]);
        }, 0);
      } else {
        notify({ status: "error", text: "다운로드할 데이터가 없습니다." });
      }
    } catch (e) {
      console.error(e);
      notify({ status: "error", text: "데이터 다운로드 중 오류가 발생했습니다." });
    } finally {
      setExportLoading(false);
    }
  };

  const csvHeaders = [
    { label: "병원명", key: "hospital" },
    { label: "이메일", key: "email" },
    { label: "고객명", key: "name" },
    { label: "전화번호", key: "phone" },
    { label: "상태", key: "isActive" },
    { label: "등급", key: "tier" },
    { label: "가입일", key: "dateJoined" },
  ];

  return (
    <PaginatorContext.Provider value={paginationValues}>
      <WindowTitle title={intl.formatMessage(sectionNames.customers)} />
      <CustomerListPage
        customers={customers}
        settings={settings}
        disabled={!data}
        loading={!data || tiersLoading}
        onUpdateListSettings={updateListSettings}
        onSort={handleSort}
        sort={getSortParams(params)}
        params={params}
        selectedCustomerIds={selectedRowIds}
        onSelectCustomerIds={handleSetSelectedCustomerIds}
        onCustomersDelete={() => openModal("remove", { ids: selectedRowIds })}
        membershipTiers={tiers}
        onExport={handleExport}
        exportLoading={exportLoading}
      />
      <ActionDialog
        open={params.action === "remove" && selectedRowIds?.length > 0}
        onClose={closeModal}
        confirmButtonState={bulkRemoveCustomersOpts.status}
        onConfirm={() =>
          bulkRemoveCustomers({
            variables: {
              ids: selectedRowIds,
            },
          })
        }
        variant="delete"
        title={intl.formatMessage({
          id: "q8ep2I",
          defaultMessage: "Delete Customers",
        })}
      >
        <FormattedMessage
          id="N2SbNc"
          defaultMessage="{counter,plural,one{Are you sure you want to delete this customer?} other{Are you sure you want to delete {displayQuantity} customers?}}"
          values={{
            counter: selectedRowIds?.length,
            displayQuantity: <strong>{selectedRowIds?.length}</strong>,
          }}
        />
      </ActionDialog>
      {csvData.length > 0 && (
        <CSVLink
          data={csvData}
          headers={csvHeaders}
          filename={`customers_${new Date().toISOString().slice(0, 10)}.csv`}
          ref={csvLink}
          target="_blank"
        />
      )}
    </PaginatorContext.Provider>
  );
};

export default CustomerList;