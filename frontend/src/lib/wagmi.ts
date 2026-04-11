import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
} from "wagmi/chains";

export function createWagmiConfig(projectId: string) {
  return getDefaultConfig({
    appName: "Yieldo",
    appDescription: "Find the best yield route across DeFi",
    appUrl: "https://yieldo.xyz",
    projectId,
    chains: [arbitrum, base, optimism, mainnet, polygon],
    ssr: true,
  });
}
