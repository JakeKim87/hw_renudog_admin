// src/events/views/EventCreate/index.tsx

import { useEventCreateMutation } from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import React from "react";

import EventCreatePage, { EventCreatePageFormData } from "../../components/EventCreatePage";
import { eventListUrl, eventUrl } from "../../urls";

const EventCreate: React.FC = () => {
  const navigate = useNavigator();
  const notify = useNotifier();

  const [createEvent, createEventOpts] = useEventCreateMutation({
    onCompleted: data => {
      if (data.eventCreate.errors.length === 0) {
        notify({ status: "success", text: "이벤트가 성공적으로 생성되었습니다." });
        // 생성된 이벤트의 상세 페이지로 이동
        navigate(eventUrl(data.eventCreate.event.id));
      }
    },
  });

  const handleSubmit = (formData: EventCreatePageFormData) => {
    createEvent({
      variables: {
        input: {
          title: formData.title,
          description: formData.description,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          pointMultiplier: formData.pointMultiplier,
          isActive: formData.isActive,
          // 프론트엔드 상태의 중첩된 배열을 GraphQL Input 형식에 맞게 변환
          // 빈 이름의 항목은 필터링하여 전송하지 않음
          addContentTypes: formData.contentTypes
            .filter(ct => ct.name)
            .map(ct => ({
              name: ct.name,
              basePoints: Number(ct.basePoints),
            })),
          addTopics: formData.topics
            .filter(t => t.name)
            .map(t => ({
              name: t.name,
              bonusPoints: Number(t.bonusPoints),
            })),
          // 생성 시에는 update, delete는 빈 배열로 전달
          updateContentTypes: [],
          updateTopics: [],
          deleteContentTypes: [],
          deleteTopics: [],
        },
      },
    });
  };

  return (
    <EventCreatePage
      disabled={createEventOpts.loading}
      saveButtonBarState={createEventOpts.status}
      onBack={() => navigate(eventListUrl())}
      onSubmit={handleSubmit}
      errors={createEventOpts.data?.eventCreate.errors || []}
    />
  );
};

export default EventCreate;