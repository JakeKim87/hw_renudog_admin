import { commonMessages } from "@dashboard/intl";
import isUrl from "is-url";
import { IntlShape } from "react-intl";
import { z } from "zod";

export const getValidationSchema = (intl: IntlShape) => {
  return z
    .object({
      name: z
        .string({
          required_error: intl.formatMessage(commonMessages.requiredField),
        })
        .min(1, intl.formatMessage(commonMessages.requiredField)),
      linkType: z
        .string({
          required_error: intl.formatMessage(commonMessages.requiredField),
          invalid_type_error: intl.formatMessage(commonMessages.requiredField),
        })
        .min(1, intl.formatMessage(commonMessages.requiredField)),
      linkValue: z
        .string({
          required_error: intl.formatMessage(commonMessages.requiredField),
        })
        .min(1, intl.formatMessage(commonMessages.requiredField)),
    })
    .refine(
      data => {
        if (data.linkType !== "link") {
          // "link" 타입이 아니면 항상 유효성 검사를 통과시킵니다.
          return true;
        }

        // 👇 수정된 부분:
        // isUrl()이 true이거나, 값이 '/'로 시작하면 유효한 것으로 간주합니다.
        const isValid = isUrl(data.linkValue) || data.linkValue.startsWith("/");
        
        return isValid;
      },
      {
        path: ["linkValue"],
        message: intl.formatMessage({
          defaultMessage: "Invalid URL or path", // 메시지를 더 명확하게 변경
          id: "invalidUrlOrPath",
          description: "Invalid url or path value",
        }),
      },
    );
};
