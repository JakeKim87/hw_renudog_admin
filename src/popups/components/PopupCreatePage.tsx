// src/popups/components/PopupCreatePage.tsx

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
import { PopupErrorFragment } from "@dashboard/graphql";
import { Box, CardContent, FormControlLabel, Switch, TextField } from "@material-ui/core";
import React, { useState } from "react";

// 폼 데이터의 타입을 정의합니다.
export interface PopupCreatePageFormData {
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  displayPage: string;
  targetUrl: string;
}

const now = new Date();
const year = now.getFullYear();
// getMonth()는 0부터 시작하므로 +1, padStart로 2자리수 맞춤 (예: 9 -> "09")
const month = String(now.getMonth() + 1).padStart(2, '0'); 
const day = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');

// YYYY-MM-DDTHH:mm 형식으로 조합
const defaultStartDate = `${year}-${month}-${day}T${hours}:${minutes}`;
const defaultEndDate = `${year + 1}-${month}-${day}T23:59`;


// 폼의 초기 상태를 정의합니다.
const initialForm: PopupCreatePageFormData = {
  title: "",
  content: "",
  startDate: defaultStartDate,
  endDate: defaultEndDate,
  isActive: false,
  displayPage: "all",
  targetUrl: "",
};

interface PopupCreatePageProps {
  disabled: boolean;
  saveButtonBarState: ConfirmButtonTransitionState;
  errors: PopupErrorFragment[];
  onBack: () => void;
  onSubmit: (data: PopupCreatePageFormData) => void;
  onImageUpload: (file: File) => void;
}

const PopupCreatePage: React.FC<PopupCreatePageProps> = ({
  disabled,
  saveButtonBarState,
  errors,
  onBack,
  onSubmit,
  onImageUpload,
}) => {
  // UI에 이미지 미리보기를 보여주기 위한 상태
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0];
      // 선택된 File 객체를 부모(View)로 전달
      onImageUpload(file);

      // 화면에 미리보기를 띄우기 위해 FileReader 사용
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container>
      <WindowTitle title={"팝업 생성"} />
      <Form initial={initialForm} onSubmit={onSubmit} confirmLeave>
        {({ data, change, submit, isSaveDisabled }) => (
          <>
            <Backlink href="#" onClick={onBack}>
              팝업 목록
            </Backlink>
            <PageHeader>새 팝업 생성</PageHeader>
            <Grid>
              <div>
                <DashboardCard>
                  <DashboardCard.Header><DashboardCard.Title>팝업 정보</DashboardCard.Title></DashboardCard.Header>
                  <DashboardCard.Content>
                    <TextField name="title" label="제목" value={data.title} onChange={change} fullWidth />
                    <CardSpacer />
                    <TextField name="targetUrl" label="클릭 시 이동할 URL" value={data.targetUrl} onChange={change} fullWidth helperText="예: /products/slug 또는 https://example.com" />
                    <CardSpacer />
                    <TextField name="content" label="내용 (HTML 가능)" value={data.content} onChange={change} fullWidth multiline minRows={10} />
                  </DashboardCard.Content>
                </DashboardCard>
              </div>
              <div>
                <DashboardCard>
                  <DashboardCard.Header><DashboardCard.Title>노출 설정</DashboardCard.Title></DashboardCard.Header>
                  <DashboardCard.Content>
                    <FormControlLabel 
                      control={
                        <Switch
                          name="isActive"
                          checked={data.isActive}
                          onChange={event => change({
                            target: {
                              name: "isActive",
                              value: event.target.checked
                            }
                          })}
                        />
                      } 
                      label="팝업 활성화" 
                    />
                    <CardSpacer />
                    <TextField name="displayPage" label="노출 페이지" value={data.displayPage} onChange={change} fullWidth helperText="'all' 또는 'main' 등 식별자 입력" />
                    <CardSpacer />
                    <TextField name="startDate" label="노출 시작일" type="datetime-local" value={data.startDate} onChange={change} fullWidth InputLabelProps={{ shrink: true }} />
                    <CardSpacer />
                    <TextField name="endDate" label="노출 종료일" type="datetime-local" value={data.endDate} onChange={change} fullWidth InputLabelProps={{ shrink: true }} />
                  </DashboardCard.Content>
                </DashboardCard>
                <CardSpacer />
                <DashboardCard>
                  <DashboardCard.Header><DashboardCard.Title>팝업 이미지</DashboardCard.Title></DashboardCard.Header>
                  <DashboardCard.Content>
                    {imagePreview ? (
                      <Box width="140px">
                        <MediaTile media={{ url: imagePreview, alt: "preview" }} onDelete={() => setImagePreview(null)} />
                      </Box>
                    ) : (
                      <ImageUpload onImageUpload={handleImageUpload} />
                    )}
                  </DashboardCard.Content>
                </DashboardCard>
              </div>
            </Grid>
            <Savebar>
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

export default PopupCreatePage;