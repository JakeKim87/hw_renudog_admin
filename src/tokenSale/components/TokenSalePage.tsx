import CardSpacer from "@dashboard/components/CardSpacer";
import Container from "@dashboard/components/Container";
import PageHeader from "@dashboard/components/PageHeader";
import {
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from "@material-ui/core";
import React from "react";

interface TokenSalePageProps {
  contractBalance: string;
  userBalance: string;
  depositAmount: string;
  setDepositAmount: (value: string) => void;
  isConnected: boolean;
  isOwner: boolean;
  isLoading: boolean;
  isInitialCheckLoading: boolean; // 초기 지갑 상태 확인 로딩
  connectButtonNode: React.ReactNode; // ConnectButton을 받을 prop
  children: React.ReactNode; // Approve/Deposit 버튼을 받을 prop
  needsApproval: boolean;
}

const TokenSalePage: React.FC<TokenSalePageProps> = ({
  contractBalance,
  userBalance,
  depositAmount,
  setDepositAmount,
  isConnected,
  isOwner,
  isLoading,
  isInitialCheckLoading,
  connectButtonNode,
  children,
  needsApproval,
}) => {
  const renderContent = () => {
    if (isInitialCheckLoading) {
      return (
        <Card>
          <CardContent style={{ textAlign: "center", padding: "4rem 0" }}>
            <CircularProgress />
            <Typography style={{ marginTop: "1rem" }}>지갑 상태를 확인하는 중입니다...</Typography>
          </CardContent>
        </Card>
      );
    }

    if (!isConnected) {
      return (
        <Card>
          <CardContent>
            <Typography>지갑을 연결하여 컨트랙트 정보를 확인하세요.</Typography>
          </CardContent>
        </Card>
      );
    }

    if (!isOwner && !isLoading) {
      return (
        <Card>
          <CardContent>
            <Typography color="error">이 페이지는 컨트랙트 소유자만 접근할 수 있습니다.</Typography>
          </CardContent>
        </Card>
      );
    }

    // 사용자가 0보다 큰 금액을 입력했는지 확인하는 변수
    const hasAmount = depositAmount && parseFloat(depositAmount) > 0;

    return (
      <Card>
        <CardContent>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
              <CircularProgress />
            </div>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                컨트랙트 정보
              </Typography>
              <Typography>
                판매 컨트랙트 GNOX 잔액: <strong>{contractBalance} GNOX</strong>
              </Typography>
              <Typography>
                내 지갑 GNOX 잔액: <strong>{userBalance} GNOX</strong>
              </Typography>
              <CardSpacer />
              <TextField
                label="입금할 GNOX 수량"
                variant="outlined"
                fullWidth
                type="number"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
              />
              <CardSpacer />

              {/* === UI 개선 최종 적용 부분: 3가지 상태 분기 === */}
              {!hasAmount ? (
                // 1. 초기 상태: 금액이 입력되지 않았을 때
                <div style={{ padding: "16px 0", marginBottom: "1rem" }}>
                  <Typography variant="body2" color="textSecondary" align="center">
                    입금할 GNOX 수량을 입력하시면 다음 단계가 안내됩니다.
                  </Typography>
                </div>
              ) : needsApproval ? (
                // 2. 승인 필요 상태: 금액이 입력되었고, 승인이 필요할 때
                <div style={{ padding: '16px', marginBottom: '1rem', border: '1px solid #ffc107', borderRadius: '4px', backgroundColor: '#fff8e1' }}>
                  <Typography variant="h6" gutterBottom style={{ color: '#ffa000' }}>
                    1단계: 먼저 승인이 필요합니다
                  </Typography>
                  <Typography variant="body2">
                    입력하신 <strong>{depositAmount} GNOX</strong>를 입금하려면, 컨트랙트가 해당 수량을 사용할 수 있도록 먼저 승인해야 합니다.
                  </Typography>
                </div>
              ) : (
                // 3. 입금 가능 상태: 금액이 입력되었고, 승인도 완료되었을 때
                <div style={{ padding: '16px', marginBottom: '1rem', border: '1px solid #4caf50', borderRadius: '4px', backgroundColor: '#e8f5e9' }}>
                  <Typography variant="h6" gutterBottom style={{ color: '#388e3c' }}>
                    2단계: 입금 준비 완료
                  </Typography>
                  <Typography variant="body2">
                    승인이 완료되었습니다. 이제 <strong>{depositAmount} GNOX</strong>를 컨트랙트로 입금할 수 있습니다.
                  </Typography>
                </div>
              )}
              {children}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container>
      <CardSpacer />
      <PageHeader title="토큰 판매 관리">{connectButtonNode}</PageHeader>
      <CardSpacer />
      {renderContent()}
    </Container>
  );
};

export default TokenSalePage;