import { gql } from "@apollo/client";

// EventCreate 뮤테이션이 성공 시 eventFragment의 모든 데이터를 반환하도록 수정
export const eventCreateMutation = gql`
  mutation EventCreate($input: EventInput!) {
    eventCreate(input: $input) {
      event {
        ...Event
      }
      errors: eventErrors {
        ...EventError
      }
    }
  }
`;

// EventUpdate 뮤테이션도 성공 시 eventFragment의 모든 데이터를 반환하도록 수정
export const eventUpdateMutation = gql`
  mutation EventUpdate($id: ID!, $input: EventInput!) {
    eventUpdate(id: $id, input: $input) {
      event {
        ...Event
      }
      errors: eventErrors {
        ...EventError
      }
    }
  }
`;

// EventDelete 뮤테이션은 수정할 필요가 없습니다.
export const eventDeleteMutation = gql`
  mutation EventDelete($id: ID!) {
    eventDelete(id: $id) {
      event {
        id
      }
      errors: eventErrors {
        ...EventError
      }
    }
  }
`;

export const eventSubmissionUpdateMutation = gql`
  mutation EventSubmissionUpdate($id: ID!, $input: EventSubmissionUpdateInput!) {
    eventSubmissionUpdate(id: $id, input: $input) {
      eventSubmission {
        ...EventSubmission
      }
      errors: eventErrors {
        ...EventError
      }
    }
  }
`;