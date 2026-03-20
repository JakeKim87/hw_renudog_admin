import { OrderLineFragment, useExchangeVariantSearchQuery } from "@dashboard/graphql";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@material-ui/core";
import { Box, Button, Text } from "@saleor/macaw-ui-next";
import React, { useEffect, useMemo,useState } from "react";

// 교환 정보 타입
export interface ExchangeAllocation {
  variantId: string;
  quantity: number;
}

interface OrderLineExchangeDialogProps {
  open: boolean;
  line: OrderLineFragment | null;
  channelSlug: string;
  onClose: () => void;
  // [핵심] 여러 개의 교환 정보를 배열로 전달
  onConfirm: (lineId: string, allocations: ExchangeAllocation[]) => void;
}

export const OrderLineExchangeDialog: React.FC<OrderLineExchangeDialogProps> = ({
  open,
  line,
  channelSlug,
  onClose,
  onConfirm,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [allocations, setAllocations] = useState<Record<string, number>>({});

  useEffect(() => {
    if (open) {
      setStep(1);
      setTotalQuantity(0);
      setAllocations({});
    }
  }, [open]);

  const categoryId = line?.variant?.product?.category?.id || "";

  const { data: productsData, loading: variantsLoading } = useExchangeVariantSearchQuery({
    variables: {
      categoryId: categoryId,
      channel: channelSlug,
    },
    skip: !line || step !== 2 || !categoryId,
    fetchPolicy: "network-only",
  });

  const availableVariants = useMemo(() => {
    if (!productsData?.products?.edges) return [];

    const allVariants = productsData.products.edges.flatMap((edge) => {
      return edge.node.variants || [];
    });

    return allVariants.filter((variant) => {
      if (!line) return false;
      if (variant.id === line.variant?.id) return false;
      // 최소 1개라도 재고가 있어야 목록에 표시
      if ((variant.quantityAvailable || 0) < 1) return false;
      return true;
    });
  }, [productsData, line]);

  if (!line) return null;

  // const fulfilled = line.quantityFulfilled || 0;
  // const maxQuantity = line.quantity - fulfilled;
  const maxQuantity = line.quantity;
  const quantityOptions = Array.from({ length: maxQuantity }, (_, i) => i + 1);
  const currentVariantName = line.variant?.name || "-";

  const currentAllocatedSum = Object.values(allocations).reduce((a, b) => a + b, 0);
  const remainingToAllocate = totalQuantity - currentAllocatedSum;

  const handleNext = () => {
    if (!totalQuantity) {
      alert("교환할 수량을 선택해주세요.");
      return;
    }
    setStep(2);
  };

  const handleAllocationChange = (variantId: string, val: number) => {
    if (val < 0) return;
    const otherSum = currentAllocatedSum - (allocations[variantId] || 0);
    const maxAllowed = totalQuantity - otherSum;
    const newQuantity = val > maxAllowed ? maxAllowed : val;

    setAllocations((prev) => ({
      ...prev,
      [variantId]: newQuantity,
    }));
  };

  const handleConfirm = () => {
    if (currentAllocatedSum !== totalQuantity) {
      alert(`총 ${totalQuantity}개를 할당해야 합니다. (현재 ${currentAllocatedSum}개)`);
      return;
    }

    const finalAllocations: ExchangeAllocation[] = Object.entries(allocations)
      .filter(([_, qty]) => qty > 0)
      .map(([variantId, qty]) => ({
        variantId,
        quantity: qty,
      }));

    if (finalAllocations.length === 0) {
      alert("교환할 옵션을 선택해주세요.");
      return;
    }

    onConfirm(line.id, finalAllocations);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {step === 1 ? "교환 수량 선택" : "교환할 상품 선택"}
      </DialogTitle>

      <DialogContent style={{ minHeight: "300px" }}>
        {step === 1 && (
          <>
            <DialogContentText>
              <strong>{line.productName}</strong> ({currentVariantName})<br />
              교환할 수량을 선택해주세요. (최대 {maxQuantity}개)
            </DialogContentText>
            <Box marginTop={2}>
              <TextField
                select
                fullWidth
                variant="outlined"
                label="수량"
                value={totalQuantity || ""}
                onChange={(e) => setTotalQuantity(Number(e.target.value))}
                SelectProps={{
                  native: false,
                  MenuProps: { style: { zIndex: 1400 } },
                }}
              >
                {quantityOptions.map((num) => (
                  <MenuItem key={num} value={num}>
                    {num}개
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </>
        )}

        {step === 2 && (
          <>
            <DialogContentText>
              총 교환 수량: <strong>{totalQuantity}개</strong> <br />
              남은 할당 수량:{" "}
              <strong style={{ color: remainingToAllocate === 0 ? "green" : "red" }}>
                {remainingToAllocate}개
              </strong>
            </DialogContentText>

            <Box
              marginTop={2}
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #eee",
                borderRadius: "4px",
                padding: "16px",
              }}
            >
              {variantsLoading ? (
                <Box display="flex" justifyContent="center" padding={4}>
                  <CircularProgress size={24} />
                </Box>
              ) : availableVariants.length === 0 ? (
                <Text color="default2">교환 가능한 상품이 없습니다.</Text>
              ) : (
                <Box display="flex" flexDirection="column" gap={2}>
                  {availableVariants.map((variant) => {
                    const myQty = allocations[variant.id] || 0;
                    const maxStock = variant.quantityAvailable || 0;
                    const limit = Math.min(maxStock, totalQuantity);

                    return (
                      <Box
                        key={variant.id}
                        // [수정] Props 에러 방지를 위해 모든 스타일을 style 객체로 이동
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px",
                            borderBottom: "1px solid #f0f0f0"
                        }}
                      >
                        {/* [수정] flex={1} -> style={{ flex: 1 }} */}
                        <Box style={{ flex: 1 }}>
                          <Typography variant="body2" style={{ fontWeight: 600 }}>
                            {variant.product.name} - {variant.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            SKU: {variant.sku} | 재고: {variant.quantityAvailable}
                          </Typography>
                        </Box>

                        {/* [수정] width="80px" -> style={{ width: "80px" }} */}
                        <Box style={{ width: "80px" }}>
                          <TextField
                            type="number"
                            variant="outlined"
                            size="small"
                            inputProps={{ min: 0, max: limit }}
                            value={myQty}
                            onChange={(e) =>
                              handleAllocationChange(variant.id, Number(e.target.value))
                            }
                            style={{ opacity: myQty > 0 ? 1 : 0.5 }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="tertiary">
          취소
        </Button>
        {step === 1 ? (
          <Button onClick={handleNext} variant="primary">
            다음
          </Button>
        ) : (
          <Box display="flex" gap={2}>
            <Button onClick={() => setStep(1)} variant="secondary">
              이전
            </Button>
            <Button
              onClick={handleConfirm}
              variant="primary"
              disabled={remainingToAllocate !== 0}
            >
              교환 실행
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};