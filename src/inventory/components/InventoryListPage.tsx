// src/inventory/components/InventoryListPage.tsx

import { TopNav } from "@dashboard/components/AppLayout/TopNav";
import { DashboardCard } from "@dashboard/components/Card";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import { OnDatagridChange } from "@dashboard/components/Datagrid/hooks/useDatagridChange";
import { ListPageLayout } from "@dashboard/components/Layouts";
import { Savebar } from "@dashboard/components/Savebar";
import { useWarehouseListQuery,WarehouseStockListQuery } from "@dashboard/graphql";
import { PageListProps,RelayToFlat } from "@dashboard/types";
import { mapEdgesToItems } from "@dashboard/utils/maps";
import { GridCell } from "@glideapps/glide-data-grid";
import { FormControl, Input, MenuItem, Select } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@saleor/macaw-ui-next";
import React, { useRef } from "react";

import { InventoryListDatagrid } from "./InventoryListDatagrid";

const useStyles = makeStyles(
  theme => ({
    filterContainer: {
      padding: theme.spacing(2, 3),
      display: "flex",
      alignItems: "flex-end",
      gap: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    filterGroup: {
      flex: 1,
    },
    buttonGroup: {
      marginLeft: "auto",
    },
    formControl: {
      minWidth: 180,
    },
  }),
  { name: "InventoryListPage" },
);

interface InventoryListPageProps extends PageListProps {
  stocks: RelayToFlat<WarehouseStockListQuery["stocks"]>;
  params: any;
  onFilterChange: (key: string, value: string) => void;
  onFilterSubmit: () => void;
  changes: Map<number, GridCell>;
  onChange: OnDatagridChange;
  onSave: () => void;
  onCancel: () => void;
  saveButtonState: ConfirmButtonTransitionState;
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

const InventoryListPage: React.FC<InventoryListPageProps> = ({
  stocks,
  params,
  onFilterChange,
  onFilterSubmit,
  changes,
  onChange,
  onSave,
  onCancel,
  saveButtonState,
  onFileUpload,
  isUploading,
  ...listProps
}) => {
  const classes = useStyles();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: warehouseData, loading: warehouseLoading } = useWarehouseListQuery({
    variables: {
      first: 100, // 한 번에 최대 100개의 창고를 가져옵니다.
    },
  });

  const warehouses = mapEdgesToItems(warehouseData?.warehouses);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // 동일한 파일을 다시 선택할 수 있도록 value 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <ListPageLayout>
      <TopNav title="재고 현황">
        <Button
          variant="secondary" // 스타일은 프로젝트 테마에 맞게 조정 (primary or secondary)
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          data-test-id="upload-stock-button"
        >
          {isUploading ? "업로드 중..." : "엑셀 업로드"}
        </Button>
        {/* 숨겨진 파일 입력 필드 */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".xlsx, .xls"
          onChange={handleFileChange}
        />
      </TopNav>
      <DashboardCard>
        <div className={classes.filterContainer}>
          <div className={classes.filterGroup}>
            <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
              <Select
                value={params.warehouse || ""}
                onChange={e => onFilterChange("warehouse", e.target.value as string)}
                displayEmpty
                disabled={warehouseLoading}
                renderValue={(selected) => {
                  if (!selected) {
                    return "창고 선택";
                  }
                  
                  const selectedWarehouse = warehouses.find(w => w.id === selected);
                  
                  return selectedWarehouse ? selectedWarehouse.name : "";
                }}
              >
                <MenuItem value=""><em>전체 창고</em></MenuItem>
                {warehouses?.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
          <div className={classes.filterGroup}>
            <Input
              value={params.search || ""}
              onChange={e => onFilterChange("search", e.target.value)}
              placeholder="상품명 또는 SKU로 검색"
              fullWidth
            />
          </div>
          <div className={classes.buttonGroup}>
            <Button onClick={onFilterSubmit} data-test-id="apply-filters-button">조회</Button>
          </div>
        </div>

        <InventoryListDatagrid
          stocks={stocks}
          {...listProps}
          changes={changes}
          onChange={onChange}
        />
      </DashboardCard>
      {changes.size > 0 && (
        <Savebar>
          <Savebar.Spacer />
          <Savebar.CancelButton onClick={onCancel} />
          <Savebar.ConfirmButton
            transitionState={saveButtonState}
            onClick={onSave}
            disabled={saveButtonState === "loading"}
          >
            저장
          </Savebar.ConfirmButton>
        </Savebar>
      )}
    </ListPageLayout>
  );
};

export default InventoryListPage;