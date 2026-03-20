// src/events/components/EventSubmissionUpdatePage.tsx

import { Backlink } from "@dashboard/components/Backlink";
import { Button } from "@dashboard/components/Button";
import { DashboardCard } from "@dashboard/components/Card";
import { CardSpacer } from "@dashboard/components/CardSpacer";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import Container from "@dashboard/components/Container";
import Form from "@dashboard/components/Form";
import { Grid } from "@dashboard/components/Grid";
import PageHeader from "@dashboard/components/PageHeader";
import { Savebar } from "@dashboard/components/Savebar";
import { WindowTitle } from "@dashboard/components/WindowTitle";
import { EventErrorFragment, EventSubmissionFragment } from "@dashboard/graphql";
import { TextField, Typography } from "@material-ui/core";
import React from "react";

export interface EventSubmissionUpdatePageFormData {
  rejectionReason: string;
}

interface EventSubmissionUpdatePageProps {
  submission: EventSubmissionFragment | undefined;
  disabled: boolean;
  saveButtonBarState: ConfirmButtonTransitionState;
  errors: EventErrorFragment[];
  onBack: () => void;
  onApprove: () => void;
  onReject: (data: EventSubmissionUpdatePageFormData) => void;
}

const EventSubmissionUpdatePage: React.FC<EventSubmissionUpdatePageProps> = ({
  submission,
  disabled,
  saveButtonBarState,
  errors,
  onBack,
  onApprove,
  onReject,
}) => {
  const initialForm: EventSubmissionUpdatePageFormData = {
    rejectionReason: submission?.rejectionReason || "",
  };

  const isApproved = submission?.status === "approved";

  return (
    <Container>
      <WindowTitle title={`제출 내역 #${submission?.id.slice(-4)}`} />
      <Form initial={initialForm} onSubmit={onReject}>
        {({ data, change, submit }) => (
          <>
            <Backlink href="#" onClick={onBack}>제출 내역 목록</Backlink>
            <PageHeader title={`제출 내역 - ${submission?.participant.businessName}`} />
            <Grid>
              <div>
                <DashboardCard>
                  <DashboardCard.Header><DashboardCard.Title>제출 정보</DashboardCard.Title></DashboardCard.Header>
                  <DashboardCard.Content>
                    <Typography variant="caption">콘텐츠 링크</Typography>
                    <Typography><a href={submission?.linkUrl} target="_blank" rel="noopener noreferrer">{submission?.linkUrl}</a></Typography>
                    <CardSpacer />
                    <Typography variant="caption">콘텐츠 유형</Typography>
                    <Typography>{submission?.contentType.name}</Typography>
                    <CardSpacer />
                    <Typography variant="caption">보너스 주제</Typography>
                    <Typography>{submission?.topic?.name || "없음"}</Typography>
                    <CardSpacer />
                    <Typography variant="caption">추가 설명</Typography>
                    <Typography>{submission?.description || "없음"}</Typography>
                  </DashboardCard.Content>
                </DashboardCard>
                <CardSpacer />
                <DashboardCard>
                    <DashboardCard.Header><DashboardCard.Title>반려 사유 (필요시 입력)</DashboardCard.Title></DashboardCard.Header>
                    <DashboardCard.Content>
                        <TextField
                            name="rejectionReason"
                            value={data.rejectionReason}
                            onChange={change}
                            fullWidth
                            multiline
                            minRows={4}
                            disabled={disabled || isApproved} 
                        />
                    </DashboardCard.Content>
                </DashboardCard>
              </div>
              <div>
                <DashboardCard>
                    <DashboardCard.Header><DashboardCard.Title>스크린샷</DashboardCard.Title></DashboardCard.Header>
                    <DashboardCard.Content>
                        {submission?.screenshotUrl ? (
                            <img src={submission.screenshotUrl} style={{ width: "100%", objectFit: "contain" }} alt="screenshot" />
                        ) : (
                            <Typography>업로드된 스크린샷이 없습니다.</Typography>
                        )}
                    </DashboardCard.Content>
                </DashboardCard>
              </div>
            </Grid>
            <Savebar>
              <Savebar.CancelButton onClick={onBack} />
              {!isApproved && ( // '승인 완료' 상태가 아닐 때만 버튼들을 보여줍니다.
                <>
                  <Button variant="secondary" onClick={submit} disabled={disabled} data-test-id="reject-button">
                    반려
                  </Button>
                  <Savebar.ConfirmButton
                    transitionState={saveButtonBarState}
                    onClick={onApprove}
                    disabled={disabled}
                    data-test-id="approve-button"
                  >
                    승인
                  </Savebar.ConfirmButton>
                </>
              )}
            </Savebar>
          </>
        )}
      </Form>
    </Container>
  );
};

export default EventSubmissionUpdatePage;