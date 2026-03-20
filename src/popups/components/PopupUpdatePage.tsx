// src/popups/components/PopupUpdatePage.tsx

import { Backlink } from "@dashboard/components/Backlink";
import { DashboardCard } from "@dashboard/components/Card";
import { CardSpacer } from "@dashboard/components/CardSpacer";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import Container from "@dashboard/components/Container";
import Form from "@dashboard/components/Form";
import { Grid } from "@dashboard/components/Grid";
import ImageUpload from "@dashboard/components/ImageUpload";
import MediaTile from "@dashboard/components/MediaTile";
import PageHeader from "@dashboard/components/PageHeader";
import { Savebar } from "@dashboard/components/Savebar";
import { WindowTitle } from "@dashboard/components/WindowTitle";
import { PopupErrorFragment, PopupFragment } from "@dashboard/graphql";
import { Box, CardContent, FormControlLabel, Switch, TextField } from "@material-ui/core";
import React, { useEffect, useState } from "react";

export interface PopupUpdatePageFormData {
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  displayPage: string;
  targetUrl: string;
  imageUrl: string | null;
}

interface PopupUpdatePageProps {
  popup: PopupFragment | undefined;
  disabled: boolean;
  saveButtonBarState: ConfirmButtonTransitionState;
  errors: PopupErrorFragment[];
  onBack: () => void;
  onSubmit: (data: PopupUpdatePageFormData) => void;
  onDelete: () => void;
  onImageUpload: (file: File) => void;
  onImageDelete: () => void;
}

const toLocalInputValue = (isoString?: string | null) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const pad = (n: number) => n.toString().padStart(2, "0");
  // 사용자의 로컬 시간대 기준으로 연,월,일,시,분 추출
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const PopupUpdatePage: React.FC<PopupUpdatePageProps> = ({
  popup,
  disabled,
  saveButtonBarState,
  errors,
  onBack,
  onSubmit,
  onDelete,
  onImageUpload,
  onImageDelete,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(popup?.imageUrl || null);

  useEffect(() => {
    // 부모 컴포넌트에서 popup 데이터가 로딩 완료되어 전달되면,
    // imagePreview 상태를 그 imageUrl 값으로 동기화합니다.
    setImagePreview(popup?.imageUrl || null);
  }, [popup]); // 의존성 배열에 'popup'을 넣어, popup prop이 변경될 때마다 이 효과가 실행되도록 합니다.

  const handleImageUpload = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0];
      onImageUpload(file);
      const reader = new FileReader();
      reader.onload = e => setImagePreview(e.target.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = () => {
    setImagePreview(null);
    onImageDelete();
  };

  const initialForm: PopupUpdatePageFormData = {
    title: popup?.title || "",
    content: popup?.content || "",
    startDate: toLocalInputValue(popup?.startDate),
    endDate: toLocalInputValue(popup?.endDate),
    isActive: popup?.isActive || false,
    displayPage: popup?.displayPage || "all",
    targetUrl: popup?.targetUrl || "",
    imageUrl: popup?.imageUrl || null,
  };

  return (
    <Container>
      <WindowTitle title={popup?.title} />
      <Form initial={initialForm} onSubmit={onSubmit} confirmLeave>
        {({ data, change, submit, isSaveDisabled }) => (
          <>
            <Backlink href="#" onClick={onBack}>
              팝업 목록
            </Backlink>
            <PageHeader title={popup?.title} />
            <Grid>
              <div>
                <DashboardCard>
                  <DashboardCard.Header>
                    <DashboardCard.Title>팝업 정보</DashboardCard.Title>
                  </DashboardCard.Header>
                  <DashboardCard.Content>
                    <TextField
                      name="title"
                      label="제목"
                      value={data.title}
                      onChange={change}
                      fullWidth
                    />
                    <CardSpacer />
                    <TextField
                      name="targetUrl"
                      label="클릭 시 이동할 URL"
                      value={data.targetUrl}
                      onChange={change}
                      fullWidth
                      helperText="예: /products/slug 또는 https://example.com"
                    />
                    <CardSpacer />
                    <TextField
                      name="content"
                      label="내용 (HTML 가능)"
                      value={data.content}
                      onChange={change}
                      fullWidth
                      multiline
                      minRows={10}
                    />
                  </DashboardCard.Content>
                </DashboardCard>
              </div>
              <div>
                <DashboardCard>
                  <DashboardCard.Header>
                    <DashboardCard.Title>노출 설정</DashboardCard.Title>
                  </DashboardCard.Header>
                  <DashboardCard.Content>
                    <FormControlLabel
                      control={
                        <Switch
                          name="isActive"
                          checked={data.isActive}
                          onChange={event =>
                            change({
                              target: {
                                name: "isActive",
                                value: event.target.checked,
                              },
                            })
                          }
                        />
                      }
                      label="팝업 활성화"
                    />
                    <CardSpacer />
                    <TextField
                      name="displayPage"
                      label="노출 페이지"
                      value={data.displayPage}
                      onChange={change}
                      fullWidth
                      helperText="'all' 또는 'main' 등 식별자 입력"
                    />
                    <CardSpacer />
                    <TextField
                      name="startDate"
                      label="노출 시작일"
                      type="datetime-local"
                      value={data.startDate}
                      onChange={change}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                    <CardSpacer />
                    <TextField
                      name="endDate"
                      label="노출 종료일"
                      type="datetime-local"
                      value={data.endDate}
                      onChange={change}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </DashboardCard.Content>
                </DashboardCard>
                <CardSpacer />
                <DashboardCard>
                  <DashboardCard.Header>
                    <DashboardCard.Title>팝업 이미지</DashboardCard.Title>
                  </DashboardCard.Header>
                  <DashboardCard.Content>
                    {imagePreview ? (
                      <Box width="140px">
                        <MediaTile
                          media={{ url: imagePreview, alt: "preview" }}
                          onDelete={handleImageDelete}
                        />
                      </Box>
                    ) : (
                      <ImageUpload onImageUpload={handleImageUpload} />
                    )}
                  </DashboardCard.Content>
                </DashboardCard>
              </div>
            </Grid>
            <Savebar>
              <Savebar.DeleteButton onClick={onDelete} />
              <Savebar.CancelButton onClick={onBack} />
              <Savebar.ConfirmButton
                transitionState={saveButtonBarState}
                onClick={submit}
                disabled={isSaveDisabled || disabled}
              >
                팝업 저장
              </Savebar.ConfirmButton>
            </Savebar>
          </>
        )}
      </Form>
    </Container>
  );
};

export default PopupUpdatePage;
