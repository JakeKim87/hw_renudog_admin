// src/events/views/EventSubmissionUpdate/index.tsx

import NotFoundPage from "@dashboard/components/NotFoundPage";
import { useEventSubmissionDetailsQuery, useEventSubmissionUpdateMutation } from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import React from "react";

import EventSubmissionUpdatePage, { EventSubmissionUpdatePageFormData } from "../../components/EventSubmissionUpdatePage";
import { eventSubmissionListUrl, EventSubmissionUrlQueryParams } from "../../urls";

interface EventSubmissionUpdateProps {
  id: string;
  params: EventSubmissionUrlQueryParams;
}

export const EventSubmissionUpdate: React.FC<EventSubmissionUpdateProps> = ({ id, params }) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const { data, loading, refetch } = useEventSubmissionDetailsQuery({ displayLoader: true, variables: { id } });

  const [updateSubmission, updateSubmissionOpts] = useEventSubmissionUpdateMutation({
    onCompleted: data => {
      if (data.eventSubmissionUpdate.errors.length === 0) {
        notify({ status: "success", text: "제출 내역이 성공적으로 업데이트되었습니다." });
        refetch();
      }
    },
  });

  const submission = data?.eventSubmission;
  if (submission === null) {
    return <NotFoundPage onBack={() => navigate(eventSubmissionListUrl())} />;
  }

  const handleApprove = () => {
    updateSubmission({
      variables: {
        id,
        input: {
          status: "approved",
        },
      },
    });
  };

  const handleReject = (formData: EventSubmissionUpdatePageFormData) => {
    updateSubmission({
        variables: {
            id,
            input: {
                status: "rejected",
                rejectionReason: formData.rejectionReason,
            }
        }
    })
  };

  return (
    <EventSubmissionUpdatePage
      submission={submission}
      disabled={loading || updateSubmissionOpts.loading}
      saveButtonBarState={updateSubmissionOpts.status}
      onBack={() => navigate(eventSubmissionListUrl())}
      onApprove={handleApprove}
      onReject={handleReject}
      errors={updateSubmissionOpts.data?.eventSubmissionUpdate.errors || []}
    />
  );
};

export default EventSubmissionUpdate;