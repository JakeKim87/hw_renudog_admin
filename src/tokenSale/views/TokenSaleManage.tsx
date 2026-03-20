// src/tokenSale/views/TokenSaleManage.tsx

import { formatUnits, parseUnits } from "ethers";
import React, { useEffect, useState } from "react";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  readContract,
} from "thirdweb";
import { polygon } from "thirdweb/chains";
import {
  ConnectButton,
  TransactionButton,
  useActiveAccount,
  useActiveWallet,
  useActiveWalletConnectionStatus,
  useDisconnect,
  useReadContract,
} from "thirdweb/react";

import { gnoTokenAbi } from "../abis/GnoToken.abi";
import { tokenSaleAbi } from "../abis/TokenSale.abi";
import TokenSalePage from "../components/TokenSalePage";

// 환경 변수
const THIRDWEB_CLIENT_ID = process.env.DASHBOARD_THIRDWEB_CLIENT_ID as string;
const TOKEN_SALE_ADDRESS = process.env.DASHBOARD_TOKEN_SALE_ADDRESS as string;
const GNO_TOKEN_ADDRESS = process.env.DASHBOARD_GNO_TOKEN_ADDRESS as string;

// Thirdweb Client 및 Contract 설정
const client = createThirdwebClient({ clientId: THIRDWEB_CLIENT_ID });
const tokenSaleContract = getContract({ client, chain: polygon, address: TOKEN_SALE_ADDRESS, abi: tokenSaleAbi });
const gnoTokenContract = getContract({ client, chain: polygon, address: GNO_TOKEN_ADDRESS, abi: gnoTokenAbi });

const INITIAL_CHECK_COMPLETED_KEY = "initialAdminWalletCheckCompleted";

const TokenSaleManage: React.FC = () => {
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    const { disconnect } = useDisconnect();
    const status = useActiveWalletConnectionStatus();

    const [depositAmount, setDepositAmount] = useState("");
    const [isOwner, setIsOwner] = useState(false);
    const [contractGnoBalance, setContractGnoBalance] = useState<bigint>(BigInt(0));
    const [userGnoBalance, setUserGnoBalance] = useState<bigint>(BigInt(0));
    
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isInitialCheckLoading, setIsInitialCheckLoading] = useState(true);

    // 페이지 진입 시 지갑 상태를 확인하고, 연결되어 있다면 해제하는 로직
    useEffect(() => {
        if (typeof window === "undefined") return;

        const hasCompletedCheck = sessionStorage.getItem(INITIAL_CHECK_COMPLETED_KEY) === "true";
        if (hasCompletedCheck) {
            setIsInitialCheckLoading(false);
            return;
        }

        if (status === "unknown") {
            setIsInitialCheckLoading(true); // 로딩 시작
            return;
        }

        if (status === "connected" && wallet) {
            disconnect(wallet);
        }

        sessionStorage.setItem(INITIAL_CHECK_COMPLETED_KEY, "true");
        setIsInitialCheckLoading(false); // 로딩 종료
    }, [wallet, disconnect, status]);


    // allowance(승인량) 실시간 조회
    // const { data: allowance, refetch: refetchAllowance } = useReadContract({
    //     contract: gnoTokenContract,
    //     method: "allowance",
    //     params: account ? [account.address, TOKEN_SALE_ADDRESS] : undefined,
    // });

    const { data: allowance, refetch: refetchAllowance, isLoading: isAllowanceLoading } = useReadContract({
        contract: gnoTokenContract,
        method: "allowance",
        params: account ? [account.address, TOKEN_SALE_ADDRESS] : undefined,
    });


    const fetchData = async () => {
        if (!account) return; // 지갑 연결 안되면 데이터 조회 안함
        
        setIsLoadingData(true);
        try {
            const [owner, contractBalance, userBalance] = await Promise.all([
                readContract({ contract: tokenSaleContract, method: "owner" }),
                readContract({ contract: gnoTokenContract, method: "balanceOf", params: [TOKEN_SALE_ADDRESS] }),
                readContract({ contract: gnoTokenContract, method: "balanceOf", params: [account.address] }),
            ]);
            setContractGnoBalance(contractBalance);
            setUserGnoBalance(userBalance);
            setIsOwner(account.address.toLowerCase() === owner.toLowerCase());
        } catch (error) {
            console.error("Failed to fetch contract data:", error);
        } finally {
            setIsLoadingData(false);
        }
    };
    
    useEffect(() => {
        fetchData();
        if (account) {
            refetchAllowance();
        }
    }, [account]);

    const amountToDepositWei = parseUnits(depositAmount || "0", 18);
    const needsApproval = allowance !== undefined && amountToDepositWei > 0 && allowance < amountToDepositWei;

    const formatBalance = (balance: bigint | undefined) => {
        if (!balance) return "0.0";
        return parseFloat(formatUnits(balance, 18)).toLocaleString(undefined, { maximumFractionDigits: 4 });
    };

    const isContentLoading = isLoadingData || (!!account && isAllowanceLoading);

    return (
        <TokenSalePage
            contractBalance={formatBalance(contractGnoBalance)}
            userBalance={formatBalance(userGnoBalance)}
            depositAmount={depositAmount}
            setDepositAmount={setDepositAmount}
            isConnected={!!account}
            isOwner={isOwner}
            isLoading={isContentLoading}
            isInitialCheckLoading={isInitialCheckLoading}
            connectButtonNode={<ConnectButton client={client} />}
            needsApproval={needsApproval}
        >
            {needsApproval ? (
                <TransactionButton
                    transaction={() =>
                        prepareContractCall({
                            contract: gnoTokenContract,
                            method: "approve",
                            params: [TOKEN_SALE_ADDRESS, amountToDepositWei],
                        })
                    }
                    onTransactionConfirmed={() => refetchAllowance()}
                    style={{ width: "100%", padding: "12px 0", fontSize: "16px" }}
                >
                    Approve
                </TransactionButton>
            ) : (
                <TransactionButton
                    transaction={() =>
                        prepareContractCall({
                            contract: tokenSaleContract,
                            method: "depositTokens",
                            params: [amountToDepositWei],
                        })
                    }
                    onTransactionConfirmed={() => {
                        alert("성공적으로 입금되었습니다!");
                        setDepositAmount("");
                        fetchData();
                        refetchAllowance();
                    }}
                    disabled={!depositAmount || amountToDepositWei <= 0}
                    style={{ width: "100%", padding: "12px 0", fontSize: "16px" }}
                >
                    Deposit GNOX
                </TransactionButton>
            )}
        </TokenSalePage>
    );
};

export default TokenSaleManage;