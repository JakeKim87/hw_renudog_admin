// src/popups/views/PopupCreate/index.tsx

import { usePopupCreateMutation } from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import PopupCreatePage, {
  PopupCreatePageFormData,
} from "@dashboard/popups/components/PopupCreatePage";
import React, { useState } from "react";

import { popupListUrl, popupUrl } from "../../urls";

const PopupCreate: React.FC = () => {
  const navigate = useNavigator();
  const notify = useNotifier();

  // 사용자가 선택한 실제 이미지 파일을 보관할 상태
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [createPopup, createPopupOpts] = usePopupCreateMutation({
    onCompleted: data => {
      if (data.popupCreate.errors.length === 0) {
        notify({ status: "success", text: "팝업이 성공적으로 생성되었습니다." });
        navigate(popupUrl(data.popupCreate.popup.id));
      }
    },
  });

  const handleSubmit = (formData: PopupCreatePageFormData) => {
    createPopup({
      variables: {
        input: {
          title: formData.title,
          content: formData.content,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          isActive: formData.isActive,
          displayPage: formData.displayPage,
          targetUrl: formData.targetUrl,
          // 상태에 보관된 File 객체를 뮤테이션 변수에 담아 전송
          image: imageFile,
        },
      },
    });
  };

  return (
    <PopupCreatePage
      disabled={createPopupOpts.loading}
      saveButtonBarState={createPopupOpts.status}
      onBack={() => navigate(popupListUrl())}
      onSubmit={handleSubmit}
      // UI 컴포넌트에서 이미지가 선택되면 이 함수가 호출되어 상태를 업데이트
      onImageUpload={setImageFile}
      errors={createPopupOpts.data?.popupCreate.errors || []}
    />
  );
};

export default PopupCreate;
