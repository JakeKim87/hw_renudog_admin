import { gql } from "@apollo/client";

export const noticeFragment = gql`
  fragment Notice on NoticeType {
    id
    isPublished
    title
    content
    viewCount
    createdAt
    updatedAt
    imageUrl
    files {
      id
      url
      name
    }
  }
`;

export const noticeErrorFragment = gql`
  fragment NoticeError on NoticeError {
    field
    message
    code
  }
`;