import { Address } from "viem";
import { qnCore } from "./client"; // Importe a instância pública do cliente
import {
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
  EXCHANGE_CONTRACT_ABI,
  FACTORY_CONTRACT_ADDRESS,
  FACTORY_CONTRACT_ABI,
} from "./constants"; // Importe ABIs e endereços de contrato

// Recuperar o endereço de troca associado a um determinado endereço de token
export const getExchangeAddress = async (address: string): Promise<Address> => {
  try {
    const exchangeAddress = (await qnCore.client.readContract({
      address: FACTORY_CONTRACT_ADDRESS,
      abi: FACTORY_CONTRACT_ABI,
      functionName: "getExchange",
      args: [address],
    })) as Address;
    return exchangeAddress;
  } catch (err) {
    console.error(err);
    return "0x";
  }
};

// Recuperar o saldo Ethereum de um determinado endereço
export const getEtherBalance = async (address: Address): Promise<bigint> => {
  if (address === "0x") {
    return BigInt(0);
  }

  try {
    const balance = await qnCore.client.getBalance({ address });

    return balance;
  } catch (err) {
    console.error(err);
    return BigInt(0);
  }
};

// Recuperar o saldo de um token específico associado a um determinado endereço
export const getTokenBalance = async (address: Address): Promise<bigint> => {
  if (address === "0x") {
    return BigInt(0);
  }

  try {
    const balanceOfToken = (await qnCore.client.readContract({
      address: TOKEN_CONTRACT_ADDRESS,
      abi: TOKEN_CONTRACT_ABI,
      functionName: "balanceOf",
      args: [address],
    })) as bigint;
    return balanceOfToken;
  } catch (err) {
    console.error(err);
    return BigInt(0);
  }
};

// Recuperar o saldo de um token LP associado a um determinado endereço
export const getLpTokenBalance = async (
  address: Address,
  exchangeAddress: Address
): Promise<bigint> => {
  if (
    address === "0x" ||
    exchangeAddress === "0x" ||
    exchangeAddress === "0x0000000000000000000000000000000000000000"
  ) {
    return BigInt(0);
  }

  try {
    const balanceOfLpToken = (await qnCore.client.readContract({
      address: exchangeAddress,
      abi: EXCHANGE_CONTRACT_ABI,
      functionName: "balanceOf",
      args: [address],
    })) as bigint;
    return balanceOfLpToken;
  } catch (err) {
    console.error(err);
    return BigInt(0);
  }
};

// Recuperar o valor de reserva de um token dentro do contrato de troca
export const getReserveOfToken = async (
  exchangeAddress: Address
): Promise<bigint> => {
  if (exchangeAddress === "0x") {
    return BigInt(0);
  }

  try {
    const reserve = (await qnCore.client.readContract({
      address: exchangeAddress,
      abi: EXCHANGE_CONTRACT_ABI,
      functionName: "getTokenReserves",
    })) as bigint;
    return reserve;
  } catch (err) {
    console.error(err);
    return BigInt(0);
  }
};

// Recuperar o símbolo do token pelo endereço
export const getTokenData = async (address: Address): Promise<string> => {
  try {
    const tokenMetadata =
      await qnCore.client.qn_getTokenMetadataByContractAddress({
        contract: address,
      });

    return tokenMetadata?.symbol ?? "Unknown";
  } catch (err) {
    console.error(err);
    return "Unknown";
  }
};