import "react-quill/dist/quill.snow.css";

import { Backlink } from "@dashboard/components/Backlink";
import CardSpacer from "@dashboard/components/CardSpacer";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import Container from "@dashboard/components/Container";
import Form from "@dashboard/components/Form";
import { Grid } from "@dashboard/components/Grid";
import PageHeader from "@dashboard/components/PageHeader";
import { Savebar } from "@dashboard/components/Savebar";
import { WindowTitle } from "@dashboard/components/WindowTitle";
import { NoticeErrorFragment, NoticeFragment } from "@dashboard/graphql";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress, // ✅ 로딩 인디케이터용
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Switch,
  TextField,
  Typography,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
// ✅ 1. lazy와 Suspense를 React에서 직접 import 합니다.
import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

// ✅ 2. React.lazy를 사용하여 ReactQuill을 동적으로 불러옵니다.
// 이 컴포넌트는 렌더링이 필요할 때만 비동기적으로 로드됩니다.
const ReactQuill = lazy(() => import("react-quill"));

const useStyles = makeStyles(
  (theme) => ({
    // ✅ 에디터 로딩 중 Placeholder 스타일
    editorPlaceholder: {
      minHeight: "600px",
      backgroundColor: "#f9f9f9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid #ccc",
      borderRadius: "4px",
      color: "#999",
    },
    editorWrapper: {
      // 툴바와 에디터 영역의 테두리를 일관되게 만듭니다.
      "& .ql-toolbar.ql-snow": {
        border: `1px solid ${theme.palette.divider}`,
        borderBottom: "none",
        borderTopLeftRadius: theme.shape.borderRadius,
        borderTopRightRadius: theme.shape.borderRadius,
      },
      "& .ql-container.ql-snow": {
        border: `1px solid ${theme.palette.divider}`,
        borderBottomLeftRadius: theme.shape.borderRadius,
        borderBottomRightRadius: theme.shape.borderRadius,
      },

      // 🔥 가장 중요한 부분: .ql-editor에 직접 min-height를 적용합니다.
      // div[data-gramm="false"] 선택자를 추가하여 우선순위를 대폭 높입니다.
      '& .ql-editor[data-gramm="false"]': {
        minHeight: "400px",
        padding: theme.spacing(2), // Material-UI 스타일과 일관성 유지
      },
    },
  }),
  { name: "NoticeUpdatePage" }
);

export interface NoticeUpdatePageFormData {
  title: string;
  content: string;
  isPublished: boolean;
  image: File | null;
  newFiles: File[];
}

interface NoticeUpdatePageProps {
  notice: NoticeFragment;
  disabled: boolean;
  saveButtonBarState: ConfirmButtonTransitionState;
  errors: NoticeErrorFragment[];
  onBack: () => void;
  onSubmit: (data: NoticeUpdatePageFormData) => void;
  onDelete: () => void;
  onDeleteFile: (fileId: string) => void;
  onEditorImageUpload: (file: File) => Promise<string>;
}

const NoticeUpdatePage: React.FC<NoticeUpdatePageProps> = ({
  notice,
  disabled,
  saveButtonBarState,
  errors,
  onBack,
  onSubmit,
  onDelete,
  onDeleteFile,
  onEditorImageUpload,
}) => {
  const classes = useStyles();
  const quillRef = useRef<any>(null);

  // ✅ 3. isClient 상태는 SSR 환경에서 에러를 방지하기 위해 유지합니다.
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;
      try {
        const url = await onEditorImageUpload(file);
        const quill = quillRef.current?.getEditor();
        const range = quill?.getSelection()?.index;
        if (range !== undefined && quill && url) {
          quill.insertEmbed(range, "image", url);
          quill.setSelection(range + 1, 0);
        }
      } catch (error) {
        console.error("에디터 이미지 업로드 실패:", error);
      }
    };
  }, [onEditorImageUpload]);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: { image: imageHandler },
    },
  }), [imageHandler]);

  const initialForm: NoticeUpdatePageFormData = {
    title: notice?.title || "",
    content: notice?.content || "",
    isPublished: notice?.isPublished || false,
    image: null,
    newFiles: [],
  };

  // ✅ 에디터 로딩 중에 보여줄 fallback UI
  const EditorLoading = () => (
    <div className={classes.editorPlaceholder}>
      <CircularProgress size={24} />
      <Typography style={{ marginLeft: 16 }}>에디터 로딩 중...</Typography>
    </div>
  );

  return (
    <Container>
      <WindowTitle title={notice?.title} />
      <Form initial={initialForm} onSubmit={onSubmit} confirmLeave key={notice?.id}>
        {({ data, change, submit, isSaveDisabled }) => (
          <>
            <Backlink href="#" onClick={onBack}> 공지사항 목록 </Backlink>
            <PageHeader title={notice?.title} />
            <Grid>
              <div>
                <Card>
                  <CardContent>
                    <TextField name="title" label={"제목"} value={data.title} onChange={change} fullWidth />
                  </CardContent>
                </Card>
                <CardSpacer />
                
                <Card>
                  <CardHeader title="내용" />
                  <CardContent>
                    {/* ✅ 4. Suspense로 감싸고, isClient일 때만 렌더링 */}
                    {isClient ? (
                      <Suspense fallback={<EditorLoading />}>
                        <div className={classes.editorWrapper}>
                          <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            modules={modules}
                            value={data.content || ""}
                            onChange={(value) => {
                              change({ target: { name: "content", value } } as any);
                            }}
                            placeholder="공지사항 내용을 입력하세요..."
                          />
                        </div>
                      </Suspense>
                    ) : (
                      <EditorLoading />
                    )}
                  </CardContent>
                </Card>

                <CardSpacer />
                
                {/* --- 나머지 코드는 동일 --- */}
                <Card>
                  <CardHeader title="첨부 파일" />
                  <CardContent>
                    {notice?.files && notice.files.length > 0 && (
                      <>
                        <Typography variant="subtitle2">기존 파일</Typography>
                        <List dense>
                          {notice.files.map((file) => (
                            <ListItem key={file.id}>
                              <ListItemText
                                primary={
                                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                                    {file.name}
                                  </a>
                                }
                              />
                              <ListItemSecondaryAction>
                                <IconButton
                                  edge="end"
                                  aria-label="delete"
                                  onClick={() => {
                                    if (window.confirm("정말 이 파일을 삭제하시겠습니까?")) {
                                      onDeleteFile(file.id);
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>
                        <CardSpacer />
                      </>
                    )}
                    <Typography variant="subtitle2" gutterBottom>새 파일 추가</Typography>
                    <input
                      style={{ display: "none" }}
                      id="file-upload"
                      multiple
                      type="file"
                      onChange={(event) => {
                        const fileList = event.target.files;
                        if (fileList) {
                          change({ target: { name: "newFiles", value: Array.from(fileList) } } as any);
                        }
                      }}
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outlined" component="span">파일 선택</Button>
                    </label>
                    {data.newFiles.length > 0 && (
                      <Typography variant="body2" style={{ marginTop: 10 }}>
                        추가될 파일: {data.newFiles.length}개
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader title={"게시 설정"} />
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          name="isPublished"
                          checked={data.isPublished}
                          onChange={(event) => {
                            change({ target: { name: "isPublished", value: event.target.checked } } as any);
                          }}
                        />
                      }
                      label={"공개"}
                    />
                    <Typography variant="caption">
                      이 옵션을 활성화하면 공지사항이 사용자에게 표시됩니다.
                    </Typography>
                  </CardContent>
                </Card>

                <CardSpacer />
                <Card>
                  <CardHeader title="대표 이미지" />
                  <CardContent>
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="image-upload"
                      type="file"
                      onChange={(event) => {
                        const file = event.target.files ? event.target.files[0] : null;
                        change({ target: { name: "image", value: file } } as any);
                      }}
                    />
                    <label htmlFor="image-upload">
                      <Button variant="outlined" component="span" fullWidth>이미지 변경</Button>
                    </label>
                    {(data.image || notice?.imageUrl) && (
                      <div style={{ marginTop: 10, textAlign: "center" }}>
                        <Typography variant="body2" gutterBottom>
                          {data.image ? "새 이미지 (저장 전)" : "현재 이미지"}
                        </Typography>
                        <img
                          src={data.image ? URL.createObjectURL(data.image) : notice?.imageUrl || ""}
                          alt="Notice Cover"
                          style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain", border: "1px solid #eee" }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
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
                저장
              </Savebar.ConfirmButton>
            </Savebar>
          </>
        )}
      </Form>
    </Container>
  );
};

NoticeUpdatePage.displayName = "NoticeUpdatePage";
export default NoticeUpdatePage;