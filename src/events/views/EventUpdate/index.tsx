// src/events/views/EventUpdate/index.tsx

import ActionDialog from "@dashboard/components/ActionDialog";
import NotFoundPage from "@dashboard/components/NotFoundPage";
import {
  useEventDeleteMutation,
  useEventDetailsQuery,
  useEventUpdateMutation,
} from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import React from "react";

import EventUpdatePage, { EventUpdatePageFormData } from "../../components/EventUpdatePage";
import { eventListUrl, eventUrl, EventUrlQueryParams } from "../../urls";

interface EventUpdateProps {
  id: string;
  params: EventUrlQueryParams;
}

export const EventUpdate: React.FC<EventUpdateProps> = ({ id, params }) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const { data, loading, refetch } = useEventDetailsQuery({
    displayLoader: true,
    variables: { id },
  });

  const [updateEvent, updateEventOpts] = useEventUpdateMutation({
    onCompleted: data => {
      if (data.eventUpdate.errors.length === 0) {
        notify({ status: "success", text: "이벤트가 성공적으로 수정되었습니다." });
        refetch();
      }
    },
  });

  const [deleteEvent, deleteEventOpts] = useEventDeleteMutation({
    onCompleted: data => {
      if (data.eventDelete.errors.length === 0) {
        notify({ status: "success", text: "이벤트가 성공적으로 삭제되었습니다." });
        navigate(eventListUrl());
      }
    },
  });

  const event = data?.event;
  if (event === null) {
    return <NotFoundPage onBack={() => navigate(eventListUrl())} />;
  }

  const handleSubmit = (formData: EventUpdatePageFormData) => {
    // 원본 데이터 (DB에 저장된 상태)
    const originalContentTypes = event.contentTypes.map(ct => ct.id);
    const originalTopics = event.topics.map(t => t.id);

    // 현재 폼 데이터 (사용자가 수정한 상태)
    const currentContentTypes = formData.contentTypes;
    const currentTopics = formData.topics;

    updateEvent({
      variables: {
        id,
        input: {
          // 기본 정보 필드
          title: formData.title,
          description: formData.description,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          pointMultiplier: formData.pointMultiplier,
          isActive: formData.isActive,

          // 1. 새로 추가된 항목 (ID가 없는 항목)
          addContentTypes: currentContentTypes
            .filter(ct => !ct.id)
            .map(ct => ({
              name: ct.name,
              basePoints: Number(ct.basePoints),
            })),

          // 2. 수정된 항목 (ID가 있는 항목)
          updateContentTypes: currentContentTypes
            .filter(ct => ct.id)
            .map(ct => ({
              id: ct.id,
              name: ct.name,
              basePoints: Number(ct.basePoints),
            })),

          // 3. 삭제된 항목 (원본에는 있었지만 현재 폼에는 없는 항목)
          deleteContentTypes: originalContentTypes.filter(
            originalId => !currentContentTypes.some(ct => ct.id === originalId)
          ),

          // Topics도 동일한 로직 적용
          addTopics: currentTopics
            .filter(t => !t.id)
            .map(t => ({
              name: t.name,
              bonusPoints: Number(t.bonusPoints),
            })),
          updateTopics: currentTopics
            .filter(t => t.id)
            .map(t => ({
              id: t.id,
              name: t.name,
              bonusPoints: Number(t.bonusPoints),
            })),
          deleteTopics: originalTopics.filter(
            originalId => !currentTopics.some(t => t.id === originalId)
          ),
        },
      },
    });
  };

  return (
    <>
      <EventUpdatePage
        event={event}
        disabled={loading || updateEventOpts.loading}
        saveButtonBarState={updateEventOpts.status}
        onBack={() => navigate(eventListUrl())}
        onSubmit={handleSubmit}
        onDelete={() => navigate(eventUrl(id, { action: "remove" }))}
        errors={updateEventOpts.data?.eventUpdate.errors || []}
      />
      <ActionDialog
        open={params.action === "remove"}
        onClose={() => navigate(eventUrl(id))}
        onConfirm={() => deleteEvent({ variables: { id } })}
        title="이벤트 삭제"
        variant="delete"
        confirmButtonState={deleteEventOpts.status}
      >
        정말로 이 이벤트를 삭제하시겠습니까?
      </ActionDialog>
    </>
  );
};

export default EventUpdate;