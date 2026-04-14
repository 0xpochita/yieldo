import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHAINS_URL = "https://li.quest/v1/chains";
const TOKENS_URL = "https://li.quest/v1/tokens";
const EARN_PROTOCOLS_URL = "https://earn.li.fi/v1/earn/protocols";
const EARN_CHAINS_URL = "https://earn.li.fi/v1/earn/chains";
const EARN_VAULTS_URL = "https://earn.li.fi/v1/earn/vaults";

type EarnChainEntry = { chainId: number };

type EarnVault = {
  chainId: number;
  underlyingTokens?: {
    address: string;
    symbol: string;
    decimals: number;
    name?: string;
  }[];
  lpTokens?: {
    address: string;
    symbol: string;
    decimals: number;
    priceUsd?: string;
  }[];
};

export async function GET() {
  const apiKey = process.env.LIFI_API_KEY;
  const headers: Record<string, string> = { accept: "application/json" };
  if (apiKey) headers["x-lifi-api-key"] = apiKey;

  try {
    // Step 1: fetch earn chains to know which chain IDs to request tokens for
    const [chainsResponse, earnChainsRes, protocolsResponse] =
      await Promise.all([
        fetch(`${CHAINS_URL}?chainTypes=EVM`, { headers, cache: "no-store" }),
        fetch(EARN_CHAINS_URL, { headers, cache: "no-store" }),
        fetch(EARN_PROTOCOLS_URL, { headers, cache: "no-store" }),
      ]);

    if (!chainsResponse.ok) {
      return NextResponse.json(
        { error: "upstream_error" },
        { status: 502 },
      );
    }

    const chainsPayload = (await chainsResponse.json()) as {
      chains?: unknown[];
    };

    // Build token chain IDs from earn chains
    let earnChainIds: number[] = [];
    if (earnChainsRes.ok) {
      try {
        const earnChains = (await earnChainsRes.json()) as EarnChainEntry[];
        earnChainIds = earnChains.map((c) => c.chainId);
      } catch {
        /* ignore */
      }
    }
    // Fallback if earn chains unavailable
    if (earnChainIds.length === 0) {
      earnChainIds = [1, 10, 56, 100, 130, 137, 146, 5000, 8453, 42161, 42220, 43114, 59144];
    }

    const tokenChainIds = earnChainIds.join(",");

    // Step 2: fetch tokens for all earn chains
    const tokensResponse = await fetch(
      `${TOKENS_URL}?chains=${tokenChainIds}`,
      { headers, cache: "no-store" },
    );

    const tokensPayload = tokensResponse.ok
      ? ((await tokensResponse.json()) as { tokens?: Record<string, unknown[]> })
      : { tokens: {} };

    let protocols: unknown[] = [];
    if (protocolsResponse.ok) {
      try {
        const protocolsPayload = (await protocolsResponse.json()) as unknown;
        if (Array.isArray(protocolsPayload)) {
          protocols = protocolsPayload;
        } else if (
          protocolsPayload &&
          typeof protocolsPayload === "object" &&
          "protocols" in protocolsPayload &&
          Array.isArray(
            (protocolsPayload as { protocols?: unknown[] }).protocols,
          )
        ) {
          protocols =
            (protocolsPayload as { protocols: unknown[] }).protocols ?? [];
        }
      } catch {
        protocols = [];
      }
    }

    // Step 3: for earn chains with no tokens from the bulk request,
    // try individual token API call first (with logoURI), then vault fallback
    const tokens = { ...(tokensPayload.tokens ?? {}) };
    const missingChains = earnChainIds.filter(
      (id) => !tokens[String(id)] || (tokens[String(id)] as unknown[]).length === 0,
    );

    if (missingChains.length > 0) {
      const perChainFetches = missingChains.map(async (chainId) => {
        // Try the main token API for this single chain (returns logoURI)
        try {
          const tokenRes = await fetch(
            `${TOKENS_URL}?chains=${chainId}`,
            { headers, cache: "no-store" },
          );
          if (tokenRes.ok) {
            const payload = (await tokenRes.json()) as {
              tokens?: Record<string, unknown[]>;
            };
            const list = payload.tokens?.[String(chainId)];
            if (list && list.length > 0) {
              return { chainId, tokens: list };
            }
          }
        } catch {
          /* continue to vault fallback */
        }

        // Fallback: extract underlying tokens from earn vaults (no logoURI)
        try {
          const res = await fetch(
            `${EARN_VAULTS_URL}?chainId=${chainId}&limit=100`,
            { headers, cache: "no-store" },
          );
          if (!res.ok) return { chainId, tokens: [] };
          const body = (await res.json()) as { data?: EarnVault[] };
          const vaults = body.data ?? [];
          const seen = new Set<string>();
          const chainTokens: Record<string, unknown>[] = [];

          for (const vault of vaults) {
            const lp = vault.lpTokens?.[0];
            for (const ut of vault.underlyingTokens ?? []) {
              if (!ut.symbol || seen.has(ut.address.toLowerCase())) continue;
              seen.add(ut.address.toLowerCase());
              chainTokens.push({
                address: ut.address,
                chainId,
                symbol: ut.symbol,
                decimals: ut.decimals,
                name: ut.name ?? ut.symbol,
                priceUSD: lp?.priceUsd ?? undefined,
              });
            }
          }
          return { chainId, tokens: chainTokens };
        } catch {
          return { chainId, tokens: [] };
        }
      });

      const results = await Promise.all(perChainFetches);
      for (const { chainId, tokens: chainTokens } of results) {
        if (chainTokens.length > 0) {
          tokens[String(chainId)] = chainTokens;
        }
      }
    }

    return NextResponse.json(
      {
        chains: chainsPayload.chains ?? [],
        tokens,
        protocols,
      },
      {
        headers: {
          "cache-control": "no-store, max-age=0, must-revalidate",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "proxy_failed",
        message: error instanceof Error ? error.message : "unknown",
      },
      { status: 502 },
    );
  }
}
