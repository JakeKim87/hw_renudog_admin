import { Backlink } from "@dashboard/components/Backlink";
import { CardSpacer } from "@dashboard/components/CardSpacer";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import Container from "@dashboard/components/Container";
import Form from "@dashboard/components/Form";
import { Grid } from "@dashboard/components/Grid";
import PageHeader from "@dashboard/components/PageHeader";
import { Savebar } from "@dashboard/components/Savebar";
import { WindowTitle } from "@dashboard/components/WindowTitle";
import { FaqErrorFragment } from "@dashboard/graphql";
import { Card, CardContent, TextField } from "@material-ui/core";
import React from "react";

// 폼 데이터 타입을 export하여 로직 파일에서 사용할 수 있게 합니다.
export interface FaqCreatePageFormData {
  title: string;
  content: string;
}

const initialForm: FaqCreatePageFormData = {
  title: "",
  content: "",
};

interface FaqCreatePageProps {
  disabled: boolean;
  saveButtonBarState: ConfirmButtonTransitionState;
  errors: FaqErrorFragment[];
  onBack: () => void;
  onSubmit: (data: FaqCreatePageFormData) => void;
}

const FaqCreatePage: React.FC<FaqCreatePageProps> = ({
  disabled,
  saveButtonBarState,
  errors,
  onBack,
  onSubmit,
}) => {

  return (
    <Container>
      <CardSpacer />
      <WindowTitle
        title={"FAQ 생성"}
      />
      <Form initial={initialForm} onSubmit={onSubmit} confirmLeave>
        {({ data, change, submit, isSaveDisabled }) => (
          <>
            <Backlink href="#" onClick={onBack}>
              FAQ 목록
            </Backlink>
            <PageHeader>
              FAQ 생성
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
              <Savebar.CancelButton onClick={onBack} />
              <Savebar.ConfirmButton
                transitionState={saveButtonBarState}
                onClick={submit}
                disabled={isSaveDisabled || disabled}
              >
                FAQ 저장
              </Savebar.ConfirmButton>
            </Savebar>
          </>
        )}
      </Form>
    </Container>
  );
};

FaqCreatePage.displayName = "FaqCreatePage";
export default FaqCreatePage;