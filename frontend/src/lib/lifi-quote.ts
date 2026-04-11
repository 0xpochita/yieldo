export type LifiQuoteToken = {
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
  name?: string;
  logoURI?: string;
  priceUSD?: string;
};

export type LifiQuoteAction = {
  fromChainId: number;
  toChainId: number;
  fromToken: LifiQuoteToken;
  toToken: LifiQuoteToken;
  fromAmount: string;
  slippage?: number;
  fromAddress?: string;
  toAddress?: string;
};

export type LifiQuoteGasCost = {
  amountUSD?: string;
  amount?: string;
  token?: LifiQuoteToken;
};

export type LifiQuoteFeeCost = {
  name?: string;
  amountUSD?: string;
  amount?: string;
  token?: LifiQuoteToken;
};

export type LifiQuoteEstimate = {
  fromAmount: string;
  toAmount: string;
  toAmountMin: string;
  approvalAddress?: string;
  executionDuration?: number;
  fromAmountUSD?: string;
  toAmountUSD?: string;
  gasCosts?: LifiQuoteGasCost[];
  feeCosts?: LifiQuoteFeeCost[];
};

export type LifiTransactionRequest = {
  data: string;
  to: string;
  value?: string;
  from?: string;
  chainId?: number;
  gasLimit?: string;
  gasPrice?: string;
};

export type LifiQuoteResponse = {
  id: string;
  type: string;
  tool: string;
  toolDetails?: {
    key?: string;
    name?: string;
    logoURI?: string;
  };
  action: LifiQuoteAction;
  estimate: LifiQuoteEstimate;
  includedSteps?: Array<{
    id?: string;
    type?: string;
    tool?: string;
    toolDetails?: { name?: string; logoURI?: string };
  }>;
  transactionRequest: LifiTransactionRequest;
};

export type FetchQuoteParams = {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAddress: string;
  toAddress?: string;
  fromAmount: string;
  slippage?: number;
};

export async function fetchQuoteViaProxy(
  params: FetchQuoteParams,
  signal?: AbortSignal,
): Promise<LifiQuoteResponse> {
  const url = new URL("/api/earn/quote", window.location.origin);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    signal,
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    let message = body;
    try {
      const parsed = JSON.parse(body) as { message?: string; error?: string };
      message = parsed.message || parsed.error || body;
    } catch {}
    throw new Error(message || `quote_failed_${response.status}`);
  }

  return (await response.json()) as LifiQuoteResponse;
}
