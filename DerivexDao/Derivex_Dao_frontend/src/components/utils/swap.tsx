// Importar ABIs e endereços de contrato
import {
    TOKEN_CONTRACT_ABI,
    TOKEN_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
  } from "./constants";
  
  // Importe as informações da cadeia Sepolia
  import { sepolia } from "viem/chains";
  
  import { Address } from "viem";
  
  // Importe os clientes públicos e de carteira para interagir com o blockchain
  import { qnCore, walletClient } from "./client";
  
  // Função para calcular a quantidade de tokens a serem recebidos de um swap
  export const getAmountOfTokensReceivedFromSwap = async (
    ethSelected: boolean,
    swapAmountWei: bigint,
    exchangeAddress: Address
  ): Promise<bigint> => {
    let amountOfTokens;
  
    // Verifique se a ETH está sendo trocada por tokens ou vice-versa
    if (ethSelected) {
      // Calcule a quantidade de tokens a serem recebidos ao trocar ETH por tokens
      amountOfTokens = (await qnCore.client.readContract({
        address: exchangeAddress,
        abi: EXCHANGE_CONTRACT_ABI,
        functionName: "getTokenAmount",
        args: [swapAmountWei],
      })) as bigint;
    } else {
      // Calcule a quantidade de tokens a serem recebidos ao trocar tokens por ETH
      amountOfTokens = (await qnCore.client.readContract({
        address: exchangeAddress,
        abi: EXCHANGE_CONTRACT_ABI,
        functionName: "getEthAmount",
        args: [swapAmountWei],
      })) as bigint;
    }
  
    return amountOfTokens;
  };
  
  // Função para realizar uma troca de token
  export const swapTokens = async (
    ethSelected: boolean,
    swapAmountWei: bigint,
    tokenToBeReceivedAfterSwap: bigint,
    account: Address,
    exchangeAddress: Address
  ) => {
    const minimumTokenToBeReceivedAfterSwap =
      (tokenToBeReceivedAfterSwap * 90n) / 100n;
  
    if (ethSelected) {
      //Trocar ETH por tokens
      const { request } = await qnCore.client.simulateContract({
        account,
        address: exchangeAddress,
        abi: EXCHANGE_CONTRACT_ABI,
        functionName: "swapEthForTokens",
        args: [minimumTokenToBeReceivedAfterSwap, account],
        value: swapAmountWei,
        chain: sepolia,
      });
  
      // Escreva a transação do contrato e aguarde a confirmação
      const hash = await walletClient.writeContract(request);
      await qnCore.client.waitForTransactionReceipt({ hash });
      console.log(`Swap Tx is: ${hash}`);
    } else {
      // Aumentar a permissão para o contrato de token
      const { request: requestOne } = await qnCore.client.simulateContract({
        account,
        address: TOKEN_CONTRACT_ADDRESS,
        abi: TOKEN_CONTRACT_ABI,
        functionName: "approve",
        args: [exchangeAddress, swapAmountWei],
        chain: sepolia,
      });
  
      // Escreva a transação do contrato e aguarde a confirmação
      let hash = await walletClient.writeContract(requestOne);
      await qnCore.client.waitForTransactionReceipt({ hash });
      console.log(`approve Tx is: ${hash}`);
  
      // Trocar tokens por ETH
      const { request: requestTwo } = await qnCore.client.simulateContract({
        account,
        address: exchangeAddress,
        abi: EXCHANGE_CONTRACT_ABI,
        functionName: "tokenForEthSwap",
        args: [swapAmountWei, minimumTokenToBeReceivedAfterSwap],
        chain: sepolia,
      });
  
      // Escreva a transação do contrato e aguarde a confirmação
      hash = await walletClient.writeContract(requestTwo);
      await qnCore.client.waitForTransactionReceipt({ hash });
      console.log(`Swap Tx is: ${hash}`);
    }
  };