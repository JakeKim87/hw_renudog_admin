import { gql } from "@apollo/client";

// EventContentType과 EventTopic을 위한 프래그먼트를 새로 만듭니다.
export const eventContentTypeFragment = gql`
  fragment EventContentType on EventContentTypeType {
    id
    name
    basePoints
    isActive
  }
`;

export const eventTopicFragment = gql`
  fragment EventTopic on EventTopicType {
    id
    name
    bonusPoints
    isActive
  }
`;

// 메인 Event 프래그먼트에서 위 프래그먼트들을 사용하여 중첩된 데이터를 가져옵니다.
export const eventFragment = gql`
  fragment Event on EventType {
    id
    title
    description
    startDate
    endDate
    pointMultiplier
    isActive
    createdAt
    updatedAt
    contentTypes {
      ...EventContentType
    }
    topics {
      ...EventTopic
    }
  }
`;

export const eventErrorFragment = gql`
  fragment EventError on EventError {
    code
    field
    message
  }
`;

export const eventSubmissionFragment = gql`
  fragment EventSubmission on EventSubmissionType {
    id
    event {
      id
      title
    }
    participant {
      id
      businessName
    }
    contentType {
      id
      name
    }
    topic {
      id
      name
    }
    linkUrl
    screenshotUrl
    description
    status
    approvedPoints
    rejectionReason
    submittedAt
    reviewedAt
  }
`;
