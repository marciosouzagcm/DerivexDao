// Importe módulos e constantes necessários
import {
    TOKEN_CONTRACT_ABI,
    TOKEN_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
  } from "./constants"; // Importar ABIs e endereços de contrato
  
  import { parseEther, Address } from "viem"; // Importe a função parseEther para converter tokens em Wei
  import { sepolia } from "viem/chains"; // Importe um contexto blockchain
  
  import { qnCore, walletClient } from "./client"; // Importar clientes blockchain
  
  // Função para adicionar liquidez ao pool de câmbio
  export const addLiquidity = async (
    addTokenAmountWei: bigint,
    addEtherAmountWei: bigint,
    account: Address,
    exchangeAddress: Address
  ) => {
    // Aumentar a permissão de tokens para o contrato de exchange
    const { request: requestOne } = await qnCore.client.simulateContract({
      account,
      address: TOKEN_CONTRACT_ADDRESS,
      abi: TOKEN_CONTRACT_ABI,
      functionName: "approve",
      args: [exchangeAddress, addTokenAmountWei],
      chain: sepolia,
    });
  
    // Escreva a transação no blockchain e aguarde o recebimento
    let hash = await walletClient.writeContract(requestOne);
    await qnCore.client.waitForTransactionReceipt({ hash });
    console.log(`approve Tx is: ${hash}`);
  
    // Adicione liquidez ao pool de câmbio
    const { request: requestTwo } = await qnCore.client.simulateContract({
      account,
      address: exchangeAddress,
      abi: EXCHANGE_CONTRACT_ABI,
      functionName: "addLiquidity",
      args: [addTokenAmountWei],
      value: addEtherAmountWei,
      chain: sepolia,
    });
  
    // Escreva a transação no blockchain e aguarde o recebimento
    hash = await walletClient.writeContract(requestTwo);
    await qnCore.client.waitForTransactionReceipt({ hash });
    console.log(`AddLiquidity Tx is: ${hash}`);
  };
  
  // Função para calcular a quantidade de tokens a serem adicionados com base na quantidade de Ether fornecida
  export const calculateToken = async (
    _addEther = "0",
    etherBalanceContract: bigint,
    tokenReserve: bigint
  ): Promise<bigint> => {
    try {
      const _addEtherAmountWei = parseEther(_addEther);
  
      // Calcule o valor do token a ser adicionado com base na fórmula
      const tokenAmount =
        (_addEtherAmountWei * tokenReserve) / etherBalanceContract;
  
      return tokenAmount;
    } catch (err) {
      console.error(err);
      return BigInt(0);
    }
  };