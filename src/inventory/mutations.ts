import { gql } from "@apollo/client";

export const uploadStock = gql`
    mutation UploadStock($file: Upload!) {
        productVariantStocksExcelUpdate(file: $file) {
            updatedCount
            failedSkus
        }
    }
`;