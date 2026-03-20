import { Backlink } from "@dashboard/components/Backlink";
import CardSpacer from "@dashboard/components/CardSpacer";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import Container from "@dashboard/components/Container";
import Form from "@dashboard/components/Form";
import { Grid } from "@dashboard/components/Grid";
import PageHeader from "@dashboard/components/PageHeader";
import { Savebar } from "@dashboard/components/Savebar";
import { WindowTitle } from "@dashboard/components/WindowTitle";
import { FaqErrorFragment,FaqFragment } from "@dashboard/graphql";
import { Card, CardContent, TextField } from "@material-ui/core";
import React from "react";

// 폼 데이터 타입을 export합니다.
export interface FaqUpdatePageFormData {
  title: string;
  content: string;
}

interface FaqUpdatePageProps {
  faq: FaqFragment; // 상세 데이터를 받아옵니다.
  disabled: boolean;
  saveButtonBarState: ConfirmButtonTransitionState;
  errors: FaqErrorFragment[];
  onBack: () => void;
  onSubmit: (data: FaqUpdatePageFormData) => void;
  onDelete: () => void; // 삭제 함수를 prop으로 받습니다.
}

const FaqUpdatePage: React.FC<FaqUpdatePageProps> = ({
  faq,
  disabled,
  saveButtonBarState,
  errors,
  onBack,
  onSubmit,
  onDelete,
}) => {

  // props로 받은 faq 데이터로 초기 폼 데이터를 설정합니다.
  const initialForm: FaqUpdatePageFormData = {
    title: faq?.title || "",
    content: faq?.content || "",
  };

  return (
    <Container>
        <CardSpacer />
        <WindowTitle title={faq?.title} />
        <Form initial={initialForm} onSubmit={onSubmit} confirmLeave>
            {({ data, change, submit, isSaveDisabled }) => (
            <>
                <Backlink href="#" onClick={onBack}>
                FAQ 목록
                </Backlink>
                <PageHeader title={faq?.title}>
                </PageHeader>
                <Grid>
                <div>
                    <Card>
                        <CardContent>
                            <TextField
                            name="title"
                            label={"제목"}
                            value={data.title}
                            onChange={change}
                            fullWidth
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <TextField
                            name="content"
                            label={"내용"}
                            value={data.content}
                            onChange={change}
                            fullWidth
                            multiline
                            rows={10}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div>{/* 오른쪽 사이드바 */}</div>
                </Grid>
                <Savebar>
                {/* Savebar 안에 삭제 버튼을 추가하는 것이 일반적인 패턴입니다. */}
                <Savebar.DeleteButton onClick={onDelete} />
                <Savebar.CancelButton onClick={onBack} />
                <Savebar.ConfirmButton
                    transitionState={saveButtonBarState}
                    onClick={submit}
                    disabled={isSaveDisabled || disabled}
                >
                    저장
                </Savebar.ConfirmButton>
                </Savebar>
            </>
            )}
        </Form>
    </Container>
  );
};

FaqUpdatePage.displayName = "FaqUpdatePage";
export default FaqUpdatePage;