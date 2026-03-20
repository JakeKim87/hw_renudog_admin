FROM node:20-alpine as builder
RUN apk --no-cache add bash
WORKDIR /app
COPY package*.json ./
ENV CI=1
RUN npm ci --legacy-peer-deps

COPY nginx/ nginx/
COPY assets/ assets/
COPY locale/ locale/
COPY scripts/ scripts/
COPY vite.config.js ./
COPY tsconfig.json ./
COPY .graphqlrc.ts ./
COPY *.d.ts ./
COPY schema.graphql ./
COPY .featureFlags/ .featureFlags/

COPY src/ src/

ARG API_URL
ARG APP_MOUNT_URI
ARG APPS_MARKETPLACE_API_URL
ARG EXTENSIONS_API_URL
ARG APPS_TUNNEL_URL_KEYWORDS
ARG STATIC_URL
ARG SKIP_SOURCEMAPS
ARG LOCALE_CODE
ARG DASHBOARD_THIRDWEB_CLIENT_ID
ARG DASHBOARD_TOKEN_SALE_ADDRESS
ARG DASHBOARD_GNO_TOKEN_ADDRESS
ARG BLOCKCHAIN_EXPLORER_URL

ENV API_URL=${API_URL:-https://api.humanwellness.kr/graphql/}
ENV APP_MOUNT_URI=${APP_MOUNT_URI:-/dashboard/}
ENV APPS_MARKETPLACE_API_URL=${APPS_MARKETPLACE_API_URL:-https://apps.saleor.io/api/v2/saleor-apps}
ENV EXTENSIONS_API_URL=${EXTENSIONS_API_URL:-https://apps.saleor.io/api/v1/extensions}
ENV APPS_TUNNEL_URL_KEYWORDS=${APPS_TUNNEL_URL_KEYWORDS}
ENV STATIC_URL=${STATIC_URL:-/dashboard/}
ENV SKIP_SOURCEMAPS=${SKIP_SOURCEMAPS:-true}
ENV LOCALE_CODE=${LOCALE_CODE:-KO}
ENV DASHBOARD_THIRDWEB_CLIENT_ID=${DASHBOARD_THIRDWEB_CLIENT_ID}
ENV DASHBOARD_TOKEN_SALE_ADDRESS=${DASHBOARD_TOKEN_SALE_ADDRESS}
ENV DASHBOARD_GNO_TOKEN_ADDRESS=${DASHBOARD_GNO_TOKEN_ADDRESS}
ENV BLOCKCHAIN_EXPLORER_URL=${BLOCKCHAIN_EXPLORER_URL}

RUN npm run build

FROM nginx:stable-alpine as runner
WORKDIR /app

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./nginx/replace-env-vars.sh /docker-entrypoint.d/50-replace-env-vars.sh
COPY --from=builder /app/build/ /app/

LABEL \
  org.opencontainers.image.title="renudog/dashboard" \
  org.opencontainers.image.description="renudog dashboard" \
  org.opencontainers.image.url="https://saleor.io/" \
  org.opencontainers.image.source="https://github.com/saleor/saleor-dashboard" \
  org.opencontainers.image.revision="$COMMIT_ID" \
  org.opencontainers.image.version="$PROJECT_VERSION" \
  org.opencontainers.image.authors="WingsFoot" \
  org.opencontainers.image.licenses="BSD 3"
