import { Backlink } from "@dashboard/components/Backlink";
import CardSpacer from "@dashboard/components/CardSpacer";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import Container from "@dashboard/components/Container";
import Form from "@dashboard/components/Form";
import { Grid } from "@dashboard/components/Grid";
import PageHeader from "@dashboard/components/PageHeader";
import { Savebar } from "@dashboard/components/Savebar";
import { WindowTitle } from "@dashboard/components/WindowTitle";
import {
  MembershipTierErrorFragment,
  MembershipTierFragment,
} from "@dashboard/graphql";
import { Card, CardContent, TextField } from "@material-ui/core";
import React from "react";

export interface MembershipTierUpdatePageFormData {
  withoutQ: string;
  withQ: string;
  preserve: string;
  earningRate: string;
  withoutQDiscountRate: string;
  withQDiscountRate: string;
  preserveDiscountRate: string;
  tokenDiscountRate: string;
}

interface MembershipTierUpdatePageProps {
  tier: MembershipTierFragment;
  disabled: boolean;
  saveButtonBarState: ConfirmButtonTransitionState;
  errors: MembershipTierErrorFragment[];
  onBack: () => void;
  onSubmit: (data: MembershipTierUpdatePageFormData) => void;
  onDelete: () => void;
}

const MembershipTierUpdatePage: React.FC<MembershipTierUpdatePageProps> = ({
  tier,
  disabled,
  saveButtonBarState,
  errors,
  onBack,
  onSubmit,
  onDelete,
}) => {

  const initialForm: MembershipTierUpdatePageFormData = {
    withoutQ: tier?.withoutQ.toString() || "0",
    withQ: tier?.withQ.toString() || "0",
    preserve: tier?.preserve.toString() || "0",
    earningRate: tier?.earningRate.toString() || "0.0",
    withoutQDiscountRate: tier?.withoutQDiscountRate?.toString() || "0.0",
    withQDiscountRate: tier?.withQDiscountRate?.toString() || "0.0",
    preserveDiscountRate: tier?.preserveDiscountRate?.toString() || "0.0",
    tokenDiscountRate: tier?.tokenDiscountRate?.toString() || "0.0",
  };

  return (
    <Container>
      <WindowTitle title={tier?.grade} />
      <Form initial={initialForm} onSubmit={onSubmit} confirmLeave>
        {({ data, change, submit, isSaveDisabled }) => {
          const handleIntegerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            const filteredValue = value.replace(/[^0-9]/g, "");
            
            change({
              target: { name, value: filteredValue },
            } as React.ChangeEvent<HTMLInputElement>);
          };

          const handleFloatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.value === "" || /^\d*\.?\d*$/.test(e.target.value)) {
              change(e);
            }
          };

          return (
            <>
              <Backlink href="#" onClick={onBack}>
                등급 목록
              </Backlink>
              <CardSpacer/>
              <PageHeader title={`등급 ${tier?.grade}`} />
              <Grid>
                <div>
                  <Card>
                    <CardContent>
                      <TextField
                        name="grade"
                        label="등급"
                        value={tier?.grade || ""}
                        disabled={true}
                        helperText="등급은 수정할 수 없습니다."
                        fullWidth
                      />
                      <CardSpacer />
                      <Grid variant="uniform">
                        <TextField
                          name="withoutQ"
                          label="without_q"
                          type="text"
                          value={data.withoutQ}
                          onChange={handleIntegerChange}
                          fullWidth
                        />
                        <TextField
                          name="withoutQDiscountRate"
                          label="withoutQ 할인율 (%)"
                          type="text"
                          value={data.withoutQDiscountRate}
                          onChange={handleFloatChange}
                          fullWidth
                          helperText="withoutQ에 적용될 할인율입니다."
                        />
                      </Grid>
                      <CardSpacer />

                      {/* withQ 가격과 할인율 */}
                      <Grid variant="uniform">
                        <TextField
                          name="withQ"
                          label="with_q"
                          type="text"
                          value={data.withQ}
                          onChange={handleIntegerChange}
                          fullWidth
                        />
                        <TextField
                          name="withQDiscountRate"
                          label="withQ 할인율 (%)"
                          type="text"
                          value={data.withQDiscountRate}
                          onChange={handleFloatChange}
                          fullWidth
                          helperText="withQ에 적용될 할인율입니다."
                        />
                      </Grid>
                      <CardSpacer />

                      {/* preserve 가격과 할인율 */}
                      <Grid variant="uniform">
                        <TextField
                          name="preserve"
                          label="preserve"
                          type="text"
                          value={data.preserve}
                          onChange={handleIntegerChange}
                          fullWidth
                        />
                        <TextField
                          name="preserveDiscountRate"
                          label="preserve 할인율 (%)"
                          type="text"
                          value={data.preserveDiscountRate}
                          onChange={handleFloatChange}
                          fullWidth
                          helperText="preserve에 적용될 할인율입니다."
                        />
                      </Grid>
                      <CardSpacer />

                      <TextField
                        name="earningRate"
                        label="적립률 (%)"
                        type="text"
                        value={data.earningRate}
                        onChange={handleFloatChange}
                        fullWidth
                      />
                      <CardSpacer />
                      <TextField
                        name="tokenDiscountRate"
                        label="토큰 할인율 (%)"
                        type="text"
                        value={data.tokenDiscountRate}
                        onChange={handleFloatChange}
                        fullWidth
                        helperText="토큰으로 결제 시 적용되는 추가 할인율입니다."
                      />
                    </CardContent>
                  </Card>
                </div>
                <div />
              </Grid>
              <Savebar>
                <Savebar.DeleteButton onClick={onDelete} />
                <Savebar.CancelButton onClick={onBack} />
                <Savebar.ConfirmButton
                  transitionState={saveButtonBarState}
                  onClick={submit}
                  disabled={isSaveDisabled || disabled}
                >
                  변경사항 저장
                </Savebar.ConfirmButton>
              </Savebar>
            </>
          );
        }}
      </Form>
    </Container>
  );
};

MembershipTierUpdatePage.displayName = "MembershipTierUpdatePage";
export default MembershipTierUpdatePage;