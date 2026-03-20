// @ts-strict-ignore
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
import { EventErrorFragment, EventFragment } from "@dashboard/graphql";
import {
  FormControlLabel,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@material-ui/core";
import { DeleteIcon } from "@saleor/macaw-ui";
import React from "react";

// 1. 숫자 입력을 위한 정제 함수 추가
const sanitizeNumericInput = (value: string) => {
  if (!value) return "";
  return String(value).replace(/\D/g, "");
};

// 2. 입력 중 문자열이 될 수 있으므로 타입 변경
export interface EventContentTypeData {
  id?: string;
  name: string;
  basePoints: number | string;
}
export interface EventTopicData {
  id?: string;
  name: string;
  bonusPoints: number | string;
}

export interface EventUpdatePageFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  pointMultiplier: number | string;
  isActive: boolean;
  contentTypes: EventContentTypeData[];
  topics: EventTopicData[];
}

interface EventUpdatePageProps {
  event: EventFragment | undefined;
  disabled: boolean;
  saveButtonBarState: ConfirmButtonTransitionState;
  errors: EventErrorFragment[];
  onBack: () => void;
  onSubmit: (data: EventUpdatePageFormData) => void;
  onDelete: () => void;
}

const EventUpdatePage: React.FC<EventUpdatePageProps> = ({
  event,
  disabled,
  saveButtonBarState,
  errors,
  onBack,
  onSubmit,
  onDelete,
}) => {
  const initialForm: EventUpdatePageFormData = {
    title: event?.title || "",
    description: event?.description || "",
    startDate: event?.startDate?.slice(0, 16) || "",
    endDate: event?.endDate?.slice(0, 16) || "",
    pointMultiplier: event?.pointMultiplier || 1.0,
    isActive: event?.isActive || false,
    contentTypes: event?.contentTypes?.map(ct => ({ id: ct.id, name: ct.name, basePoints: ct.basePoints })) || [],
    topics: event?.topics?.map(t => ({ id: t.id, name: t.name, bonusPoints: t.bonusPoints })) || [],
  };

  return (
    <Container>
      <WindowTitle title={event?.title} />
      <Form initial={initialForm} onSubmit={onSubmit} confirmLeave>
        {({ data, change, submit, isSaveDisabled }) => {
          // 3. 핸들러 로직 수정
          const addContentType = () => change({ target: { name: 'contentTypes', value: [...data.contentTypes, { name: '', basePoints: "" }] } });
          const removeContentType = (index: number) => change({ target: { name: 'contentTypes', value: data.contentTypes.filter((_, i) => i !== index) } });
          const handleContentTypeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
            const { name, value } = event.target;
            const newContentTypes = [...data.contentTypes];
            const processedValue = name === 'basePoints' ? sanitizeNumericInput(value) : value;
            (newContentTypes[index] as any)[name] = processedValue;
            change({ target: { name: 'contentTypes', value: newContentTypes } });
          };

          const addTopic = () => change({ target: { name: 'topics', value: [...data.topics, { name: '', bonusPoints: "" }] } });
          const removeTopic = (index: number) => change({ target: { name: 'topics', value: data.topics.filter((_, i) => i !== index) } });
          const handleTopicChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
              const { name, value } = event.target;
              const newTopics = [...data.topics];
              const processedValue = name === 'bonusPoints' ? sanitizeNumericInput(value) : value;
              (newTopics[index] as any)[name] = processedValue;
              change({ target: { name: 'topics', value: newTopics } });
          };

          return (
            <>
              <Backlink href="#" onClick={onBack}>이벤트 목록</Backlink>
              <PageHeader title={event?.title} />
              <Grid>
                {/* 4. 왼쪽 컬럼 레이아웃 수정 */}
                <div>
                  <DashboardCard>
                    <DashboardCard.Header><DashboardCard.Title>기본 정보</DashboardCard.Title></DashboardCard.Header>
                    <DashboardCard.Content>
                      <TextField name="title" label="이벤트명" value={data.title} onChange={change} fullWidth disabled={disabled} />
                      <CardSpacer />
                      <TextField name="description" label="설명" value={data.description} onChange={change} fullWidth multiline minRows={5} disabled={disabled} />
                    </DashboardCard.Content>
                  </DashboardCard>
                  <CardSpacer />
                  <DashboardCard>
                    <DashboardCard.Header>
                      <DashboardCard.Title>콘텐츠 유형</DashboardCard.Title>
                      <DashboardCard.Toolbar><Button onClick={addContentType} disabled={disabled} data-test-id="add-content-type">추가</Button></DashboardCard.Toolbar>
                    </DashboardCard.Header>
                    <Table>
                      <TableHead><TableRow><TableCell>이름</TableCell><TableCell>기본 포인트</TableCell><TableCell align="right">액션</TableCell></TableRow></TableHead>
                      <TableBody>
                        {data.contentTypes.map((ct, index) => (
                          <TableRow key={ct.id || `new-${index}`}>
                            <TableCell><TextField name="name" value={ct.name} onChange={e => handleContentTypeChange(e, index)} fullWidth disabled={disabled} /></TableCell>
                            <TableCell>
                              {/* 5. TextField 속성 변경 */}
                              <TextField name="basePoints" type="text" inputMode="numeric" value={ct.basePoints} onChange={e => handleContentTypeChange(e, index)} fullWidth disabled={disabled} />
                            </TableCell>
                            <TableCell align="right"><IconButton onClick={() => removeContentType(index)} disabled={disabled}><DeleteIcon /></IconButton></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </DashboardCard>
                  <CardSpacer />
                  {/* '보너스 주제' 섹션을 왼쪽 컬럼으로 이동 */}
                  <DashboardCard>
                    <DashboardCard.Header>
                      <DashboardCard.Title>보너스 주제</DashboardCard.Title>
                      <DashboardCard.Toolbar><Button onClick={addTopic} disabled={disabled} data-test-id="add-topic">추가</Button></DashboardCard.Toolbar>
                    </DashboardCard.Header>
                    <Table>
                      <TableHead><TableRow><TableCell>이름</TableCell><TableCell>보너스 포인트</TableCell><TableCell align="right">액션</TableCell></TableRow></TableHead>
                      <TableBody>
                        {data.topics.map((topic, index) => (
                          <TableRow key={topic.id || `new-${index}`}>
                            <TableCell><TextField name="name" value={topic.name} onChange={e => handleTopicChange(e, index)} fullWidth disabled={disabled} /></TableCell>
                            <TableCell>
                              {/* 5. TextField 속성 변경 */}
                              <TextField name="bonusPoints" type="text" inputMode="numeric" value={topic.bonusPoints} onChange={e => handleTopicChange(e, index)} fullWidth disabled={disabled} />
                            </TableCell>
                            <TableCell align="right"><IconButton onClick={() => removeTopic(index)} disabled={disabled}><DeleteIcon /></IconButton></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </DashboardCard>
                </div>
                {/* 오른쪽 컬럼 */}
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
                        label="이벤트 활성화" 
                        disabled={disabled} 
                      />
                      <CardSpacer />
                      <TextField 
                        name="pointMultiplier" 
                        label="포인트 배율" 
                        type="text" 
                        value={data.pointMultiplier} 
                        onChange={e => change({ target: { name: e.target.name, value: e.target.value.replace(/[^0-9.]/g, '') } })} 
                        fullWidth
                        disabled={disabled}
                      />
                      <CardSpacer />
                      <TextField name="startDate" label="시작일" type="datetime-local" value={data.startDate} onChange={change} fullWidth InputLabelProps={{ shrink: true }} disabled={disabled} />
                      <CardSpacer />
                      <TextField name="endDate" label="종료일" type="datetime-local" value={data.endDate} onChange={change} fullWidth InputLabelProps={{ shrink: true }} disabled={disabled} />
                    </DashboardCard.Content>
                  </DashboardCard>
                </div>
              </Grid>
              <Savebar>
                <Savebar.DeleteButton onClick={onDelete} />
                <Savebar.CancelButton onClick={onBack} />
                <Savebar.ConfirmButton transitionState={saveButtonBarState} onClick={submit} disabled={isSaveDisabled || disabled}>이벤트 저장</Savebar.ConfirmButton>
              </Savebar>
            </>
          )
        }}
      </Form>
    </Container>
  );
};

export default EventUpdatePage;