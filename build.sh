#!/bin/bash

# --- 스크립트 설정 ---
REGISTRY="ghcr.io"
DOCKERHUB_ID="jakekim87"
IMAGE_NAME="hw_renudog"
TAG="admin-latest"

# --- .env 파일 로드 ---
if [ -f .env ]; then
  echo "✅ 관리자용 .env 파일을 로드합니다."
  export $(grep -v '^#' .env | xargs)
else
  echo "❌ .env 파일이 없습니다. 스크립트를 중단합니다."
  exit 1
fi

# --- 빌드 및 푸시 실행 ---
echo "🚀 관리자 대시보드(linux/amd64) 이미지 빌드를 시작합니다..."

docker buildx build --platform linux/amd64 \
  --build-arg API_URL="${API_URL}" \
  --build-arg APP_MOUNT_URI="${APP_MOUNT_URI}" \
  --build-arg APPS_MARKETPLACE_API_URL="${APPS_MARKETPLACE_API_URL}" \
  --build-arg EXTENSIONS_API_URL="${EXTENSIONS_API_URL}" \
  --build-arg APPS_TUNNEL_URL_KEYWORDS="${APPS_TUNNEL_URL_KEYWORDS}" \
  --build-arg STATIC_URL="${STATIC_URL}" \
  --build-arg SKIP_SOURCEMAPS="${SKIP_SOURCEMAPS}" \
  --build-arg LOCALE_CODE="${LOCALE_CODE}" \
  --build-arg BLOCKCHAIN_EXPLORER_URL="${BLOCKCHAIN_EXPLORER_URL}" \
  --build-arg DASHBOARD_THIRDWEB_CLIENT_ID="${DASHBOARD_THIRDWEB_CLIENT_ID}" \
  --build-arg DASHBOARD_TOKEN_SALE_ADDRESS="${DASHBOARD_TOKEN_SALE_ADDRESS}" \
  --build-arg DASHBOARD_GNO_TOKEN_ADDRESS="${DASHBOARD_GNO_TOKEN_ADDRESS}" \
  -t ${REGISTRY}/${DOCKERHUB_ID}/${IMAGE_NAME}:${TAG} . --push

# --- 완료 메시지 ---
if [ $? -eq 0 ]; then
    echo "✅ 빌드 및 푸시 완료! 이미지: ${REGISTRY}/${DOCKERHUB_ID}/${IMAGE_NAME}:${TAG}"
else
    echo "❌ 빌드 또는 푸시에 실패했습니다."
    exit 1
fi