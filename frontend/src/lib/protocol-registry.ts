type ProtocolMetaEntry = {
  name: string;
  logo: string;
};

const PROTOCOL_REGISTRY: Record<string, ProtocolMetaEntry> = {
  "yo-protocol": {
    name: "Yo Protocol",
    logo: "/Assets/Images/Logo-DeFi/yo-protocol-logo.png",
  },
  morpho: {
    name: "Morpho",
    logo: "/Assets/Images/Logo-DeFi/morpho-logo.webp",
  },
  euler: {
    name: "Euler Finance",
    logo: "/Assets/Images/Logo-DeFi/euler-finance-logo.svg",
  },
  aave: {
    name: "Aave",
    logo: "/Assets/Images/Logo-DeFi/aave-logo.svg",
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
};

export function resolveProtocol(rawName: string | null | undefined): ResolvedProtocol {
  const slug = (rawName ?? "").toLowerCase().trim();
  if (!slug) {
    return { slug: "", displayName: "Unknown", logoPath: null };
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
      logoPath: entry.logo,
    };
  }

  return {
    slug,
    displayName: titleCaseSlug(slug),
    logoPath: null,
  };
}
