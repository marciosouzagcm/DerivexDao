// Importe módulos e constantes necessários
import { FACTORY_CONTRACT_ADDRESS, FACTORY_CONTRACT_ABI } from "./constants";

import { Address } from "viem";
import { sepolia } from "viem/chains";

import { qnCore, walletClient } from "./client";

//Função para criar um novo contrato de troca para um token
export const createNewExchange = async (
  tokenAddress: string,
  account: Address
) => {
  // Simule a chamada da função de contrato "createNewExchange"
  const { request: requestOne } = await qnCore.client.simulateContract({
    account,
    address: FACTORY_CONTRACT_ADDRESS,
    abi: FACTORY_CONTRACT_ABI,
    functionName: "createNewExchange",
    args: [tokenAddress],
    chain: sepolia,
  });

  // Escreva a transação no blockchain e aguarde o recebimento
  const hash = await walletClient.writeContract(requestOne);
  await qnCore.client.waitForTransactionReceipt({ hash });
  console.log(`createNewExchange Tx is: ${hash}`);
};