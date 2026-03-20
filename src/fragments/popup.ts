// src/graphql/fragments/Popup.ts

import { gql } from "@apollo/client";

export const popupFragment = gql`
  fragment Popup on PopupType {
    id
    title
    content
    imageUrl
    startDate
    endDate
    isActive
    displayPage
    targetUrl
    createdAt
    updatedAt
  }
`;

export const popupErrorFragment = gql`
  fragment PopupError on PopupError {
    code
    field
    message
  }
`;