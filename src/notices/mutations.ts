import { gql } from "@apollo/client";

export const noticeCreateMutation = gql`
  mutation NoticeCreate($input: NoticeInput!) {
    noticeCreate(input: $input) {
      notice {
        id
        title
        imageUrl
        files {
          id
          url
          name
        }
      }
      errors: noticeErrors {
        ...NoticeError
      }
    }
  }
`;

export const noticeUpdateMutation = gql`
  mutation NoticeUpdate($id: ID!, $input: NoticeInput!) {
    noticeUpdate(id: $id, input: $input) {
      notice {
        id
        title
        content
        isPublished
        imageUrl
        files {
          id
          url
          name
        }
      }
      errors: noticeErrors {
        ...NoticeError
      }
    }
  }
`;

export const noticeDeleteMutation = gql`
  mutation NoticeDelete($id: ID!) {
    noticeDelete(id: $id) {
      notice {
        id
      }
      errors: noticeErrors {
        ...NoticeError
      }
    }
  }
`;

export const noticeFileDeleteMutation = gql`
  mutation NoticeFileDelete($id: ID!) {
    noticeFileDelete(id: $id) {
      noticeFile {
        id
      }
      errors: noticeErrors {
        ...NoticeError
      }
    }
  }
`;