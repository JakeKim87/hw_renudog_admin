import ActionDialog from "@dashboard/components/ActionDialog";
import NotFoundPage from "@dashboard/components/NotFoundPage";
import {
  usePopupDeleteMutation,
  usePopupDetailsQuery,
  usePopupUpdateMutation,
} from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import React, { useState } from "react";

import PopupUpdatePage, { PopupUpdatePageFormData } from "../../components/PopupUpdatePage";
import { popupListUrl, popupUrl, PopupUrlQueryParams } from "../../urls";

interface PopupUpdateProps {
  id: string;
  params: PopupUrlQueryParams;
}

export const PopupUpdate: React.FC<PopupUpdateProps> = ({ id, params }) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  
  // 사용자가 새로 업로드할 이미지 파일을 보관할 상태
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data, loading } = usePopupDetailsQuery({
    displayLoader: true,
    variables: { id },
  });

  const [updatePopup, updatePopupOpts] = usePopupUpdateMutation({
    onCompleted: data => {
      if (data.popupUpdate.errors.length === 0) {
        // 이미지를 새로 업로드했다면, 상태를 초기화
        if (imageFile) setImageFile(null);
        notify({ status: "success", text: "팝업이 성공적으로 수정되었습니다." });
      }
    },
  });

  const [deletePopup, deletePopupOpts] = usePopupDeleteMutation({
    onCompleted: data => {
      if (data.popupDelete.errors.length === 0) {
        notify({ status: "success", text: "팝업이 성공적으로 삭제되었습니다." });
        navigate(popupListUrl());
      }
    },
  });

  const popup = data?.popup;
  if (popup === null) {
    return <NotFoundPage onBack={() => navigate(popupListUrl())} />;
  }

  const handleSubmit = (formData: PopupUpdatePageFormData) => {
    // 1. 기본 입력 데이터 구성
    const input: any = { // 또는 PopupUpdateInput 타입 사용
      title: formData.title,
      content: formData.content,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      isActive: formData.isActive,
      displayPage: formData.displayPage,
      targetUrl: formData.targetUrl,
    };

    // 2. 이미지 처리 로직 (가장 중요한 부분!)
    if (imageFile) {
      input.image = imageFile;
    } else if (formData.imageUrl === null) {
      input.image = null;
    } 

    updatePopup({
      variables: {
        id,
        input,
      },
    });
  };

  const handleImageDelete = () => {
    // 이미지를 null로 설정하여 삭제하는 뮤테이션을 실행
    updatePopup({
      variables: { id, input: { image: null } },
    });
  };

  return (
    <>
      <PopupUpdatePage
        popup={popup}
        disabled={loading || updatePopupOpts.loading}
        saveButtonBarState={updatePopupOpts.status}
        onBack={() => navigate(popupListUrl())}
        onSubmit={handleSubmit}
        onDelete={() => navigate(popupUrl(id, { action: "remove" }))}
        onImageUpload={setImageFile}
        onImageDelete={handleImageDelete}
        errors={updatePopupOpts.data?.popupUpdate.errors || []}
      />
      <ActionDialog
        open={params.action === "remove"}
        onClose={() => navigate(popupUrl(id))}
        onConfirm={() => deletePopup({ variables: { id } })}
        title="팝업 삭제"
        variant="delete"
        confirmButtonState={deletePopupOpts.status}
      >
        정말로 이 팝업을 삭제하시겠습니까?
      </ActionDialog>
    </>
  );
};

export default PopupUpdate;