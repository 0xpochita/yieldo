import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHAINS_URL = "https://li.quest/v1/chains";
const TOKENS_URL = "https://li.quest/v1/tokens";
const EARN_PROTOCOLS_URL = "https://earn.li.fi/v1/earn/protocols";
const SUPPORTED_CHAIN_IDS = "1,10,137,8453,42161";

export async function GET() {
  const apiKey = process.env.LIFI_API_KEY;
  const headers: Record<string, string> = { accept: "application/json" };
  if (apiKey) headers["x-lifi-api-key"] = apiKey;

  try {
    const [chainsResponse, tokensResponse, protocolsResponse] =
      await Promise.all([
        fetch(`${CHAINS_URL}?chainTypes=EVM`, { headers, cache: "no-store" }),
        fetch(`${TOKENS_URL}?chains=${SUPPORTED_CHAIN_IDS}`, {
          headers,
          cache: "no-store",
        }),
        fetch(EARN_PROTOCOLS_URL, { headers, cache: "no-store" }),
      ]);

    if (!chainsResponse.ok || !tokensResponse.ok) {
      return NextResponse.json(
        { error: "upstream_error" },
        { status: 502 },
      );
    }

    const chainsPayload = (await chainsResponse.json()) as {
      chains?: unknown[];
    };
    const tokensPayload = (await tokensResponse.json()) as {
      tokens?: Record<string, unknown[]>;
    };

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

    return NextResponse.json(
      {
        chains: chainsPayload.chains ?? [],
        tokens: tokensPayload.tokens ?? {},
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
