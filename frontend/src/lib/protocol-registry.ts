type ProtocolMetaEntry = {
  name: string;
  logo: string;
  url?: string;
};

const PROTOCOL_REGISTRY: Record<string, ProtocolMetaEntry> = {
  "yo-protocol": {
    name: "Yo Protocol",
    logo: "/Assets/Images/Logo-DeFi/yo-protocol-logo.png",
    url: "https://app.yo.xyz/vault/arbitrum/yousd",
  },
  morpho: {
    name: "Morpho",
    logo: "/Assets/Images/Logo-DeFi/morpho-logo.webp",
    url: "https://app.morpho.org",
  },
  euler: {
    name: "Euler Finance",
    logo: "/Assets/Images/Logo-DeFi/euler-finance-logo.svg",
    url: "https://app.euler.finance",
  },
  aave: {
    name: "Aave",
    logo: "/Assets/Images/Logo-DeFi/aave-logo.svg",
    url: "https://app.aave.com",
  },
  compound: {
    name: "Compound",
    logo: "",
    url: "https://app.compound.finance",
  },
  yearn: {
    name: "Yearn",
    logo: "",
    url: "https://yearn.fi/vaults",
  },
  lido: {
    name: "Lido",
    logo: "",
    url: "https://stake.lido.fi",
  },
  spark: {
    name: "Spark",
    logo: "",
    url: "https://app.spark.fi",
  },
  fluid: {
    name: "Fluid",
    logo: "",
    url: "https://fluid.instadapp.io",
  },
};

function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => {
      if (/^v\d+$/i.test(word)) return word.toLowerCase();
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export type ResolvedProtocol = {
  slug: string;
  displayName: string;
  logoPath: string | null;
  protocolUrl: string | null;
};

export function resolveProtocol(rawName: string | null | undefined): ResolvedProtocol {
  const slug = (rawName ?? "").toLowerCase().trim();
  if (!slug) {
    return { slug: "", displayName: "Unknown", logoPath: null, protocolUrl: null };
  }

  const parts = slug.split("-");
  const maybeVersion = parts[parts.length - 1] ?? "";
  const hasVersion = /^v\d+$/i.test(maybeVersion) && parts.length > 1;
  const baseKey = hasVersion ? parts.slice(0, -1).join("-") : slug;
  const version = hasVersion ? maybeVersion.toLowerCase() : null;

  const entry = PROTOCOL_REGISTRY[baseKey];
  if (entry) {
    return {
      slug,
      displayName: version ? `${entry.name} ${version}` : entry.name,
      logoPath: entry.logo || null,
      protocolUrl: entry.url ?? null,
    };
  }

  return {
    slug,
    displayName: titleCaseSlug(slug),
    logoPath: null,
    protocolUrl: null,
  };
}

const AAVE_MARKETS: Record<number, string> = {
  1: "proto_mainnet_v3",
  10: "proto_optimism_v3",
  56: "proto_bnb_v3",
  100: "proto_gnosis_v3",
  137: "proto_polygon_v3",
  146: "proto_sonic_v3",
  8453: "proto_base_v3",
  42161: "proto_arbitrum_v3",
  43114: "proto_avalanche_v3",
  534352: "proto_scroll_v3",
};

const MORPHO_CHAINS: Record<number, string> = {
  1: "ethereum",
  8453: "base",
  42161: "arbitrum",
};

const EULER_CHAINS: Record<number, string> = {
  1: "ethereum",
  8453: "base",
  42161: "arbitrum",
};

const SPARK_MARKETS: Record<number, string> = {
  1: "proto_spark_v3",
  100: "proto_spark_gnosis_v3",
};

export function resolvePositionUrl(
  protocolSlug: string,
  chainId: number,
  tokenAddress: string,
): string | null {
  const parts = protocolSlug.toLowerCase().split("-");
  const maybeVersion = parts[parts.length - 1] ?? "";
  const hasVersion = /^v\d+$/i.test(maybeVersion) && parts.length > 1;
  const baseKey = hasVersion ? parts.slice(0, -1).join("-") : protocolSlug.toLowerCase();

  if (baseKey === "aave") {
    const market = AAVE_MARKETS[chainId];
    if (market && tokenAddress) {
      return `https://app.aave.com/reserve-overview/?underlyingAsset=${tokenAddress.toLowerCase()}&marketName=${market}`;
    }
  }

  if (baseKey === "morpho") {
    const network = MORPHO_CHAINS[chainId];
    if (network && tokenAddress) {
      return `https://app.morpho.org/vault?vault=${tokenAddress.toLowerCase()}&network=${network}`;
    }
  }

  if (baseKey === "euler") {
    const network = EULER_CHAINS[chainId];
    if (network && tokenAddress) {
      return `https://app.euler.finance/vault/${tokenAddress.toLowerCase()}?network=${network}`;
    }
  }

  if (baseKey === "spark") {
    const market = SPARK_MARKETS[chainId];
    if (market && tokenAddress) {
      return `https://app.spark.fi/reserve-overview/?underlyingAsset=${tokenAddress.toLowerCase()}&marketName=${market}`;
    }
  }

  if (baseKey === "compound" && tokenAddress) {
    return `https://app.compound.finance/markets/${tokenAddress.toLowerCase()}`;
  }

  const entry = PROTOCOL_REGISTRY[baseKey];
  return entry?.url ?? null;
}
