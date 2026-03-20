// src/popups/components/PopupImage.tsx

import { DashboardCard } from "@dashboard/components/Card";
import ImageUpload from "@dashboard/components/ImageUpload";
import MediaTile from "@dashboard/components/MediaTile";
import { PopupFragment } from "@dashboard/graphql";
import { Box, Skeleton, Text } from "@saleor/macaw-ui-next";
import React from "react";

interface PopupImageProps {
  popup: PopupFragment | undefined;
  loading: boolean;
  onImageUpload: (file: File) => void;
  onImageDelete: () => void;
}

const PopupImage: React.FC<PopupImageProps> = ({
  popup,
  loading,
  onImageUpload,
  onImageDelete,
}) => {
  const handleImageUpload = (files: FileList) => {
    if (files.length > 0) {
      onImageUpload(files[0]);
    }
  };

  const image = popup?.imageUrl ? { id: popup.id, url: popup.imageUrl, alt: popup.title } : null;

  return (
    <DashboardCard>
      <DashboardCard.Header>
        <DashboardCard.Title>
          팝업 이미지
        </DashboardCard.Title>
      </DashboardCard.Header>
      <DashboardCard.Content>
        {loading && <Skeleton />}
        {!loading && image && (
          <Box __width="140px">
            <MediaTile media={image} onDelete={onImageDelete} />
          </Box>
        )}
        {!loading && !image && (
          <ImageUpload onImageUpload={handleImageUpload} />
        )}
        {!loading && image && (
            <Text size={2} color="default2" marginTop={4}>
              새 이미지를 업로드하면 기존 이미지가 교체됩니다.
            </Text>
        )}
      </DashboardCard.Content>
    </DashboardCard>
  );
};

export default PopupImage;