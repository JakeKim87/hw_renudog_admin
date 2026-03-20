import { TopNav } from "@dashboard/components/AppLayout/TopNav";
import { DashboardCard } from "@dashboard/components/Card";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import Grid from "@dashboard/components/Grid";
import { Savebar } from "@dashboard/components/Savebar";
import { ProductMediaType } from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import { commonMessages } from "@dashboard/intl";
import { productUrl } from "@dashboard/products/urls";
import { TextField } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";
import { Skeleton, vars } from "@saleor/macaw-ui-next";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import ProductMediaNavigation from "../ProductMediaNavigation";

const messages = defineMessages({
  editMedia: {
    id: "Ihp4D3",
    defaultMessage: "Edit Media",
    description: "header",
  },
  mediaInformation: {
    id: "9RvXNg",
    defaultMessage: "Media Information",
    description: "section header",
  },
  mediaView: {
    id: "cW1RIo",
    defaultMessage: "Media View",
    description: "section header",
  },
  optional: {
    id: "lzdvwp",
    defaultMessage: "Optional",
    description: "field is optional",
  },
});

const useStyles = makeStyles(
  theme => ({
    image: {
      height: "100%",
      objectFit: "contain",
      width: "100%",
    },
    imageContainer: {
      "& iframe": {
        width: "100%",
        maxHeight: 420,
      },
      border: `1px solid ${vars.colors.border.default1}`,
      borderRadius: theme.spacing(),
      margin: `0 auto ${theme.spacing(2)}px`,
      width: "100%",
      padding: theme.spacing(2),
    },
  }),
  { name: "ProductMediaPage" },
);

interface ProductMediaPageProps {
  productId: string;
  mediaObj?: {
    id: string;
    alt: string;
    url: string;
    type: string;
    oembedData?: string;
  };
  media?: Array<{
    id: string;
    url: string;
  }>;
  disabled: boolean;
  product: string;
  saveButtonBarState: ConfirmButtonTransitionState;
  onDelete: () => void;
  onRowClick: (id: string) => () => void;
  onSubmit: (data: { description: string }) => void;
}

const ProductMediaPage: React.FC<ProductMediaPageProps> = props => {
  const {
    productId,
    disabled,
    mediaObj,
    media,
    saveButtonBarState,
    onDelete,
    onRowClick,
    onSubmit,
  } = props;
  const classes = useStyles(props);
  const intl = useIntl();
  const navigate = useNavigator();

  const initialValues = { description: mediaObj ? mediaObj.alt : "" };

  // 1. React Hook Form 초기화
  const { register, handleSubmit, watch, reset, formState } = useForm({
    defaultValues: initialValues,
    mode: "onChange",
  });
  
  const { isDirty, isSubmitting } = formState;

  // 2. 미디어 정보(mediaObj)가 로드되거나 변경되면 폼 값을 업데이트
  useEffect(() => {
    if (mediaObj) {
      reset({ description: mediaObj.alt });
    }
  }, [mediaObj?.id, mediaObj?.alt, reset]);

  // 3. 값 실시간 감시 (TextField 표시용)
  const descriptionValue = watch("description");

  return (
    // 4. HTML form 태그 + handleSubmit 적용
    <form onSubmit={handleSubmit(onSubmit)}>
      <TopNav href={productUrl(productId)} title={intl.formatMessage(messages.editMedia)} />
      <Grid variant="inverted">
        <div>
          <ProductMediaNavigation
            disabled={disabled}
            media={media}
            highlighted={media ? mediaObj?.id : undefined}
            onRowClick={onRowClick}
          />
          <DashboardCard>
            <DashboardCard.Header>
              <DashboardCard.Title>
                {intl.formatMessage(messages.mediaInformation)}
              </DashboardCard.Title>
            </DashboardCard.Header>
            <DashboardCard.Content>
              <TextField
                // 5. register 등록
                {...register("description")}
                label={intl.formatMessage(commonMessages.description)}
                helperText={intl.formatMessage(messages.optional)}
                disabled={disabled}
                // watch로 가져온 값 할당
                value={descriptionValue}
                multiline
                fullWidth
              />
            </DashboardCard.Content>
          </DashboardCard>
        </div>
        <div>
          <DashboardCard>
            <DashboardCard.Header>
              <DashboardCard.Title>
                {intl.formatMessage(messages.mediaView)}
              </DashboardCard.Title>
            </DashboardCard.Header>
            <DashboardCard.Content>
              {mediaObj ? (
                mediaObj?.type === ProductMediaType.IMAGE ? (
                  <div className={classes.imageContainer}>
                    <img className={classes.image} src={mediaObj.url} alt={mediaObj.alt} />
                  </div>
                ) : (
                  <div
                    className={classes.imageContainer}
                    dangerouslySetInnerHTML={{
                      __html: JSON.parse(mediaObj?.oembedData)?.html,
                    }}
                  />
                )
              ) : (
                <Skeleton />
              )}
            </DashboardCard.Content>
          </DashboardCard>
        </div>
      </Grid>
      <Savebar>
        <Savebar.DeleteButton onClick={onDelete} />
        <Savebar.Spacer />
        <Savebar.CancelButton onClick={() => navigate(productUrl(productId))} />
        <Savebar.ConfirmButton
          transitionState={saveButtonBarState}
          // 6. Submit 핸들러 연결
          onClick={handleSubmit(onSubmit)}
          // 변경사항이 없거나(isDirty false), 제출 중이면 비활성화 (disabled props가 true면 무조건 비활성)
          disabled={disabled || isSubmitting || !isDirty}
        />
      </Savebar>
    </form>
  );
};

ProductMediaPage.displayName = "ProductMediaPage";
export default ProductMediaPage;