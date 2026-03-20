// @ts-strict-ignore
import { useBonusVariantSearchQuery } from "@dashboard/graphql"; // Codegen으로 생성된 훅
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from "@material-ui/core";
import { Box, Button, Text } from "@saleor/macaw-ui-next";
import React, { useEffect, useMemo, useState } from "react";

export interface BonusAllocation {
  variantId: string;
  quantity: number;
}

interface OrderLineAddBonusDialogProps {
  open: boolean;
  channelSlug: string;
  onClose: () => void;
  onConfirm: (allocations: BonusAllocation[]) => void;
}

export const OrderLineAddBonusDialog: React.FC<OrderLineAddBonusDialogProps> = ({
  open,
  channelSlug,
  onClose,
  onConfirm,
}) => {
  const [allocations, setAllocations] = useState<Record<string, number>>({});

  // 다이얼로그가 열릴 때 상태 초기화
  useEffect(() => {
    if (open) {
      setAllocations({});
    }
  }, [open]);

  // [수정] 생성된 훅(useBonusVariantSearchQuery) 사용
  // skip: !open 옵션을 주어 다이얼로그가 열릴 때만 쿼리가 실행되도록 함
  const { data: productsData, loading } = useBonusVariantSearchQuery({
    variables: {
      channel: channelSlug,
      search: "", // 검색어 없이 전체 조회를 위해 빈 문자열 전달
    },
    skip: !open,
    fetchPolicy: "network-only",
  });

  const availableVariants = useMemo(() => {
    if (!productsData?.products?.edges) return [];

    return productsData.products.edges
      .flatMap(edge => {
        return edge.node.variants || [];
      })
      .filter(v => (v.quantityAvailable || 0) > 0);
  }, [productsData]);

  const handleAllocationChange = (variantId: string, val: number) => {
    if (val < 0) return;

    setAllocations(prev => ({
      ...prev,
      [variantId]: val,
    }));
  };

  const handleConfirm = () => {
    const finalAllocations: BonusAllocation[] = Object.entries(allocations)
      .filter(([_, qty]) => qty > 0)
      .map(([variantId, qty]) => ({
        variantId,
        quantity: qty,
      }));

    if (finalAllocations.length === 0) {
      alert("추가할 상품의 수량을 1개 이상 입력해주세요.");
      return;
    }

    onConfirm(finalAllocations);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>샘플/보너스 상품 추가</DialogTitle>

      <DialogContent style={{ minHeight: "400px", display: "flex", flexDirection: "column" }}>
        <DialogContentText>
          주문에 추가할 샘플이나 보너스 상품의 수량을 입력하세요.
        </DialogContentText>

        <Box
          style={{
            flex: 1,
            overflowY: "auto",
            border: "1px solid #eee",
            borderRadius: "4px",
            padding: "16px",
            maxHeight: "400px",
            marginTop: "16px",
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" padding={4}>
              <CircularProgress size={24} />
            </Box>
          ) : availableVariants.length === 0 ? (
            <Box display="flex" justifyContent="center" padding={4}>
              <Text color="default2">추가 가능한 상품이 없습니다.</Text>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {availableVariants.map(variant => {
                const myQty = allocations[variant.id] || 0;
                const maxStock = variant.quantityAvailable || 0;

                return (
                  <Box
                    key={variant.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Box style={{ flex: 1, paddingRight: "16px" }}>
                      <Typography variant="body2" style={{ fontWeight: 600 }}>
                        {variant.product.name}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {variant.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        SKU: {variant.sku} | 재고: {maxStock}
                      </Typography>
                    </Box>

                    <Box style={{ width: "80px" }}>
                      <TextField
                        type="number"
                        variant="outlined"
                        size="small"
                        inputProps={{ min: 0, max: maxStock }}
                        value={myQty}
                        onChange={e => handleAllocationChange(variant.id, Number(e.target.value))}
                        placeholder="0"
                        style={{ opacity: myQty > 0 ? 1 : 0.6 }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="tertiary">
          취소
        </Button>
        <Button
          onClick={handleConfirm}
          variant="primary"
          disabled={Object.values(allocations).every(q => q === 0)}
        >
          추가하기
        </Button>
      </DialogActions>
    </Dialog>
  );
};
