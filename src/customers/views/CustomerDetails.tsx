// @ts-strict-ignore
import ActionDialog from "@dashboard/components/ActionDialog";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton"; // --- ADDED ---
import NotFoundPage from "@dashboard/components/NotFoundPage";
import { WindowTitle } from "@dashboard/components/WindowTitle";
import {
  DepositManageMutationVariables,
  ExchangeCancellationBulkCreateMutationVariables,
  LegacyOrderBulkCreateMutationVariables,
  PointManageMutationVariables,
  useCustomerDepositHistoryQuery,
  useCustomerPointHistoryQuery,
  useDepositCancelMutation,
  useDepositManageMutation,
  useExchangeCancellationBulkCreateMutation,
  useLegacyOrderBulkCreateMutation,
  usePointManageMutation,
  useRemoveCustomerMutation,
  useUpdateCustomerEmailByStaffMutation,
  useUpdateCustomerMutation,
  useUpdateMetadataMutation,
  useUpdatePrivateMetadataMutation,
  useUserMembershipUpdateMutation,
} from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import { commonMessages } from "@dashboard/intl";
import { extractMutationErrors, getStringOrPlaceholder } from "@dashboard/misc";
import createMetadataUpdateHandler from "@dashboard/utils/handlers/metadataUpdateHandler";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import CustomerDetailsPage, {
  CustomerDetailsPageFormData,
  DepositData, // --- ADDED ---
  PointData,   // --- ADDED ---
} from "../components/CustomerDetailsPage";
import { useCustomerDetails } from "../hooks/useCustomerDetails";
import { CustomerDetailsProvider } from "../providers/CustomerDetailsProvider";
import { customerListUrl, customerUrl, CustomerUrlQueryParams } from "../urls";

interface CustomerDetailsViewProps {
  id: string;
  params: CustomerUrlQueryParams;
}

const CustomerDetailsViewInner: React.FC<CustomerDetailsViewProps> = ({ id, params }) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const intl = useIntl();
  const { customer, tiers, reps, loading, refetch } = useCustomerDetails();

  const [updateEmail, updateEmailOpts] = useUpdateCustomerEmailByStaffMutation({
    onCompleted: data => {
      if (data.accountEmailUpdateByStaff.errors.length === 0) {
        notify({
          status: "success",
          text: intl.formatMessage({
            id: "email_update_success",
            defaultMessage: "이메일이 성공적으로 변경되었습니다.",
          }),
        });
        // refetch(); // 필요하다면 데이터 새로고침
      }
      // 오류는 각 컴포넌트에서 처리하거나 여기서 공통 처리 가능
    },
  });

  const handleEmailUpdate = (email: string) => {
    return updateEmail({
      variables: {
        id,
        email,
      },
    });
  };

  const [removeCustomer, removeCustomerOpts] = useRemoveCustomerMutation({
    onCompleted: data => {
      if (data.customerDelete.errors.length === 0) {
        notify({
          status: "success",
          text: intl.formatMessage({
            id: "PXatmC",
            defaultMessage: "Customer Removed",
          }),
        });
        navigate(customerListUrl());
      }
    },
  });

  const [updateCustomer, updateCustomerOpts] = useUpdateCustomerMutation({
    onCompleted: data => {
      if (data.customerUpdate.errors.length === 0) {
        notify({
          status: "success",
          text: intl.formatMessage(commonMessages.savedChanges),
        });
      }
    },
  });

  const [pointManage, pointManageOpts] = usePointManageMutation({
    onCompleted: data => {
      if (data.pointManage.pointSystemErrors.length === 0) {
        notify({
          status: "success",
          text: "포인트가 성공적으로 처리되었습니다.",
        });

        if (refetch) refetch();
      } else {
        notify({
          status: "error",
          text: data.pointManage.pointSystemErrors[0]?.message || "오류가 발생했습니다.",
        });
      }
    },
  });

  const [depositManage, depositManageOpts] = useDepositManageMutation({
    onCompleted: data => {
      if (data.depositManage.depositSystemErrors.length === 0) {
        notify({
          status: "success",
          text: "예치금이 성공적으로 처리되었습니다.",
        });
        
        if (refetch) refetch();
      } else {
        notify({
          status: "error",
          text: data.depositManage.depositSystemErrors[0]?.message || "오류가 발생했습니다.",
        });
      }
    },
  });

  const [updateMetadata] = useUpdateMetadataMutation({});
  const [updatePrivateMetadata] = useUpdatePrivateMetadataMutation({});
  
  const { data: pointData, loading: pointLoading } = useCustomerPointHistoryQuery({
    variables: { id, first: 20 },
    skip: !id,
    fetchPolicy: "cache-and-network",
  });


  const { data: depositData, loading: depositLoading, refetch: refetchDeposits } =
    useCustomerDepositHistoryQuery({
      variables: { id, first: 20 },
      skip: !id,
      fetchPolicy: "cache-and-network",
    });

  const [depositCancel, depositCancelOpts] = useDepositCancelMutation({
    onCompleted: data => {
      if (data.depositCancel.errors.length === 0) {
        notify({
          status: "success",
          text: intl.formatMessage({
            id: "deposit_cancel_success",
            defaultMessage: "예치금 충전이 성공적으로 취소되었습니다.",
          }),
        });
        refetch(); // 고객 기본 정보(잔액) 새로고침
        refetchDeposits(); // 예치금 내역 새로고침
      } else {
        notify({
          status: "error",
          text: data.depositCancel.errors[0]?.message || intl.formatMessage(commonMessages.somethingWentWrong),
        });
      }
    },
  });

  const [
    uploadExchangeCancellations,
    uploadExchangeCancellationsOpts,
  ] = useExchangeCancellationBulkCreateMutation({
    onCompleted: data => {
      const errors = data.exchangeCancellationBulkCreate.exchangeCancellationErrors;
      if (errors.length === 0) {
        notify({
          status: "success",
          text: intl.formatMessage(
            {
              id: "exchange_cancellation_upload_success",
              defaultMessage: "{count}개의 교환/취소 내역이 성공적으로 업로드되었습니다.",
            },
            {
              count: data.exchangeCancellationBulkCreate.createdCount,
            },
          ),
        });
      } else {
        // 엑셀 파일 처리 중 발생한 오류를 사용자에게 알려줍니다.
        const errorMessage = errors[0];
        notify({
          status: "error",
          title: intl.formatMessage({
            id: "upload_error_title",
            defaultMessage: "업로드 실패",
          }),
          text: `행 ${errorMessage.rowIndex}: ${errorMessage.message}`,
        });
      }
    },
  });

  const [
    uploadLegacyOrders,
    uploadLegacyOrdersOpts,
  ] = useLegacyOrderBulkCreateMutation({
    onCompleted: data => {
      const errors = data.legacyOrderBulkCreate.legacyOrderErrors;
      if (errors.length === 0) {
        notify({
          status: "success",
          text: intl.formatMessage(
            {
              id: "legacy_order_upload_success",
              defaultMessage: "{count}개의 과거 주문 내역이 성공적으로 업로드되었습니다.",
            },
            {
              count: data.legacyOrderBulkCreate.createdCount,
            },
          ),
        });
      } else {
        const errorMessage = errors[0];
        notify({
          status: "error",
          title: intl.formatMessage({
            id: "upload_error_title",
            defaultMessage: "업로드 실패",
          }),
          text: `행 ${errorMessage.rowIndex}: ${errorMessage.message}`,
        });
      }
    },
  });

  const handleExchangeCancellationUpload = (file: File) => {
    const variables: ExchangeCancellationBulkCreateMutationVariables = {
      file,
      userId: id, // 현재 고객 상세 페이지의 유저 ID를 전달합니다.
    };
    uploadExchangeCancellations({ variables });
  };

  const handleLegacyOrderUpload = (file: File) => {
    const variables: LegacyOrderBulkCreateMutationVariables = {
      file,
      userId: id, // 현재 고객 ID 전달
    };
    uploadLegacyOrders({ variables });
  };

  const user = customer?.user;

  const [updateMembership, updateMembershipOpts] = useUserMembershipUpdateMutation({
    onCompleted: data => {
      if (data.userMembershipUpdate.errors.length === 0) {
        notify({
          status: "success",
          text: "회원 등급이 성공적으로 업데이트되었습니다.",
        });
        // refetch()를 호출할 필요가 없습니다. Apollo Client가
        // ID 기반으로 캐시를 자동으로 업데이트해줍니다.
        // 만약 업데이트가 안되면 refetch()를 호출합니다.
      }
    },
  });

  const handleTierChange = (tierId: string | null) => {
    updateMembership({
      variables: {
        userId: id,
        input: {
          tierId: tierId, // tierId가 null이면 등급이 제거됩니다.
        },
      },
    });
  };

  if (!loading && user === null) {
    return <NotFoundPage backHref={customerListUrl()} />;
  }

  const handleDepositCancel = (historyId: string) => {
    depositCancel({ variables: { historyId } });
  };

  const updateData = async (data: CustomerDetailsPageFormData) =>
    extractMutationErrors(
      updateCustomer({
        variables: {
          id,
          input: {
            email: data.email,
            firstName: data.firstName,
            isActive: data.isActive,
            lastName: data.lastName,
            note: data.note,
            businessName: data.businessName,
            representativeName: data.representativeName,
            businessRegistrationNumber: data.businessRegistrationNumber,
            businessPhone: data.businessPhone,
            departmentName: data.departmentName,
            managerName: data.managerName,
            managerContact: data.managerContact,
            salesRepresentative: data.salesRepresentative,
          },
        },
      }),
    );

  const handleSubmit = createMetadataUpdateHandler(
    {
      ...user,
      privateMetadata: user?.privateMetadata || [],
    },
    updateData,
    variables => updateMetadata({ variables }),
    variables => updatePrivateMetadata({ variables }),
  );

  // --- ADDED START ---
  const handlePointManage = (data: PointData) => {
    const variables: PointManageMutationVariables = {
      userId: id,
      points: data.points,
      reason: data.reason,
    };

    pointManage({ variables });
  };

  const handleDepositManage = (data: DepositData) => {
    const variables: DepositManageMutationVariables = {
      userId: id,
      amount: data.amount,
      reason: data.reason,
    };

    depositManage({ variables });
  };

  const saveButtonBarState: ConfirmButtonTransitionState = updateCustomerOpts.loading
    ? "loading"
    : "default";
  
  const removeButtonState: ConfirmButtonTransitionState = removeCustomerOpts.loading
    ? "loading"
    : "default";

  return (
    <>
      <WindowTitle title={user?.email} data-test-id="user-email-title" />
      <CustomerDetailsPage
        customerId={id}
        customer={user}
        disabled={
          loading || updateCustomerOpts.loading || removeCustomerOpts.loading
        }
        errors={updateCustomerOpts.data?.customerUpdate.errors || []}
        saveButtonBar={saveButtonBarState}
        onSubmit={handleSubmit}
        onDelete={() =>
          navigate(
            customerUrl(id, {
              action: "remove",
            }),
          )
        }
        pointManageOpts={pointManageOpts}
        depositManageOpts={depositManageOpts}
        onPointManage={handlePointManage}
        onDepositManage={handleDepositManage}
        depositHistoryData={depositData?.user}
        depositHistoryLoading={loading || depositLoading}
        pointHistoryData={pointData?.user}
        pointHistoryLoading={loading || pointLoading}
        onDepositCancel={handleDepositCancel}
        depositCancelOpts={depositCancelOpts}
        tiers={tiers}
        reps={reps}
        onTierChange={handleTierChange}
        updateMembershipOpts={updateMembershipOpts}
        exchangeCancellationUploadOpts={uploadExchangeCancellationsOpts}
        onExchangeCancellationUpload={handleExchangeCancellationUpload}
        legacyOrderUploadOpts={uploadLegacyOrdersOpts}
        onLegacyOrderUpload={handleLegacyOrderUpload}
        onEmailUpdate={handleEmailUpdate}
        updateEmailOpts={updateEmailOpts}
      />
      <ActionDialog
        confirmButtonState={removeButtonState}
        onClose={() => navigate(customerUrl(id), { replace: true })}
        onConfirm={() =>
          removeCustomer({
            variables: {
              id,
            },
          })
        }
        title={intl.formatMessage({
          id: "ey0lZj",
          defaultMessage: "Delete Customer",
          description: "dialog header",
        })}
        variant="delete"
        open={params.action === "remove"}
      >
        <FormattedMessage
          id="2p0tZx"
          defaultMessage="Are you sure you want to delete {email}?"
          description="delete customer, dialog content"
          values={{
            email: <strong>{getStringOrPlaceholder(user?.email)}</strong>,
          }}
        />
      </ActionDialog>
    </>
  );
};

export const CustomerDetailsView: React.FC<CustomerDetailsViewProps> = ({ id, params }) => (
  <CustomerDetailsProvider id={id}>
    <CustomerDetailsViewInner id={id} params={params} />
  </CustomerDetailsProvider>
);
export default CustomerDetailsView;