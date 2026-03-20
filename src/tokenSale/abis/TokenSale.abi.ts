// src/abis/TokenSale.abi.ts

// 변수로 내보내고, 배열 리터럴의 끝에 'as const'를 붙여줍니다.
export const tokenSaleAbi = [
	{
		inputs: [
			{
				internalType: "address",
				name: "_gnoTokenAddress",
				type: "address",
			},
			{
				internalType: "address",
				name: "_paymentTokenAddress",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "_priceInPaymentToken",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "_wallet",
				type: "address",
			},
			{
				internalType: "address",
				name: "initialOwner",
				type: "address",
			},
			{
				internalType: "address",
				name: "_trustedForwarder",
				type: "address",
			},
		],
		stateMutability: "nonpayable",
		type: "constructor",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address",
			},
		],
		name: "OwnableInvalidOwner",
		type: "error",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "account",
				type: "address",
			},
		],
		name: "OwnableUnauthorizedAccount",
		type: "error",
	},
	{
		inputs: [],
		name: "ReentrancyGuardReentrantCall",
		type: "error",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "previousOwner",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "newOwner",
				type: "address",
			},
		],
		name: "OwnershipTransferred",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint256",
				name: "newPrice",
				type: "uint256",
			},
		],
		name: "PriceUpdated",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "productId",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "price",
				type: "uint256",
			},
		],
		name: "ProductPriceSet",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "buyer",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "cost",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "transactionId",
				type: "bytes32",
			},
		],
		name: "PurchaseMade",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
		],
		name: "TokensDeposited",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "purchaser",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "gnoAmount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "paymentTokenAmount",
				type: "uint256",
			},
		],
		name: "TokensPurchased",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
		],
		name: "TokensWithdrawn",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "newWallet",
				type: "address",
			},
		],
		name: "WalletUpdated",
		type: "event",
	},
	{
		inputs: [],
		name: "GNO_DECIMALS",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_gnoAmountToBuy",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256",
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8",
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32",
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32",
			},
		],
		name: "buyTokens",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_amount",
				type: "uint256",
			},
		],
		name: "depositTokens",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "gnoToken",
		outputs: [
			{
				internalType: "contract IERC20Permit",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "forwarder",
				type: "address",
			},
		],
		name: "isTrustedForwarder",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "owner",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "paymentToken",
		outputs: [
			{
				internalType: "contract IERC20Permit",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "pricePerToken",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		name: "productPrices",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_totalCost",
				type: "uint256",
			},
			{
				internalType: "bytes32",
				name: "_transactionId",
				type: "bytes32",
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256",
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8",
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32",
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32",
			},
		],
		name: "purchase",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "_tokenAddress",
				type: "address",
			},
		],
		name: "rescueMistakenTokens",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_newPrice",
				type: "uint256",
			},
		],
		name: "setPrice",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_productId",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "_priceInGNO",
				type: "uint256",
			},
		],
		name: "setProductPrice",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "_newWallet",
				type: "address",
			},
		],
		name: "setWallet",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "newOwner",
				type: "address",
			},
		],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "wallet",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_amount",
				type: "uint256",
			},
		],
		name: "withdrawUnsoldTokens",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const;
