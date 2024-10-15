import Core from "@quicknode/sdk/core";
import {
  createWalletClient,
  createPublicClient,
  http,
  custom,
  Address,
} from "viem";
import { sepolia } from "viem/chains";
import "viem/window";

export const qnCore = new Core({
  endpointUrl: import.meta.env.VITE_VERCEL_QUICKNODE_ENDPOINT,
  config: {
    addOns: { nftTokenV2: true },
  },
});

// Crie um transporte HTTP para comunicação com o nó Sepolia
const transport = http(import.meta.env.VITE_VERCEL_QUICKNODE_ENDPOINT);

// Crie um cliente blockchain público usando a cadeia Sepolia e o transporte HTTP
export const publicClient = createPublicClient({
  chain: sepolia,
  transport,
});

// Crie um cliente blockchain de carteira usando a cadeia Sepolia e o provedor Ethereum do navegador
export const walletClient = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum!),
});

// Recuperar o endereço da conta do usuário usando o cliente de carteira
let account: Address;

(async () => {
  [account] = await walletClient.getAddresses();
})();

export { account };