// src/graphql/mutations/Popup.ts

import { gql } from "@apollo/client";


export const popupCreateMutation = gql`
  mutation PopupCreate($input: PopupInput!) {
    popupCreate(input: $input) {
      popup {
        ...Popup
      }
      errors: popupErrors {
        ...PopupError
      }
    }
  }
`;

export const popupUpdateMutation = gql`
  mutation PopupUpdate($id: ID!, $input: PopupInput!) {
    popupUpdate(id: $id, input: $input) {
      popup {
        ...Popup
      }
      errors: popupErrors {
        ...PopupError
      }
    }
  }
`;

export const popupDeleteMutation = gql`
  mutation PopupDelete($id: ID!) {
    popupDelete(id: $id) {
      popup {
        id
      }
      errors: popupErrors {
        ...PopupError
      }
    }
  }
`;