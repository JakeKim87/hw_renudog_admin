import { gql } from "@apollo/client";

// 관리자가 출고 요청을 업데이트하기 위한 뮤테이션
export const agencyTransferUpdateMutation = gql`
  mutation AgencyTransferUpdate($id: ID!, $input: AgencyTransferUpdateInput!) {
    agencyTransferUpdate(id: $id, input: $input) {
      agencyTransfer {
        ...AgencyTransfer
      }
      errors {
        field
        message
        code
      }
    }
  }
`;
