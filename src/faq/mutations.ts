import { gql } from "@apollo/client";

export const faqCreateMutation = gql`
    mutation FaqCreate($input: FaqInput!) {
        faqCreate(input: $input) {
            faq {
                id
                title
            }
            errors {
                field
                message
                code
            }
        }
    }
`;

export const faqUpdateMutation = gql`
    mutation FaqUpdate($id: ID!, $input: FaqInput!) {
        faqUpdate(id: $id, input: $input) {
            faq {
                id
                title
                content
                isPublished
                author
                category {
                    id
                    name
                }
            }
            errors {
                field
                message
                code
            }
        }
    }
`;

export const faqDeleteMutation = gql`
    mutation FaqDelete($id: ID!) {
        faqDelete(id: $id) {
            faq {
                id
            }
            errors {
                field
                message
                code
            }
        }
    }

`;