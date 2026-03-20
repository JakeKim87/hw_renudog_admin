import { gql } from "@apollo/client";

export const faqFragment = gql`
    fragment Faq on Faq {
        id
        title
        content
        author
        createdAt
        viewCount
        category {
            id
            name
        }
    }
`;

export const faqErrorFragment = gql`
    fragment FaqError on FaqError {
        field
        message
        code
    }
`;