import { IntlConfig, IntlShape } from "react-intl/src/types";

export const config: IntlConfig = {
  defaultLocale: "ko",
  locale: "ko",
};

export const intlMock = {
  formatMessage: ({ defaultMessage }) => defaultMessage,
} as IntlShape;
