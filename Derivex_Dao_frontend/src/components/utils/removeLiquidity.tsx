import { EXCHANGE_CONTRACT_ABI } from "./constants"; // Importe a ABI e o endereço do contrato
import { sepolia } from "viem/chains"; // Importe os detalhes da cadeia
import { qnCore, walletClient } from "./client"; // Importe as instâncias do cliente
import { Address } from "viem";

// Simule e execute a remoção de tokens de liquidez do pool
export const removeLiquidity = async (
  removeLPTokensWei: bigint,
  account: Address,
  exchangeAddress: Address
) => {
  {
    const { request } = await qnCore.client.simulateContract({
      account,
      address: exchangeAddress,
      abi: EXCHANGE_CONTRACT_ABI,
      functionName: "removeLiquidity",
      args: [removeLPTokensWei],
      chain: sepolia,
    });

    const hash = await walletClient.writeContract(request);
    await qnCore.client.waitForTransactionReceipt({ hash });
    console.log(`RemoveLiquidity Tx is: ${hash}`);
  }
};

// Calcule os valores de Ether e tokens após remover a liquidez
export const getTokensAfterRemove = async (
  removeLPTokenWei: bigint,
  ethReserve: bigint,
  tokenReserve: bigint,
  exchangeAddress: Address
): Promise<TokenAfterRemove> => {
  try {
    // Obtenha o fornecimento total de tokens de liquidez no pool
    const _totalSupply = (await qnCore.client.readContract({
      address: exchangeAddress,
      abi: EXCHANGE_CONTRACT_ABI,
      functionName: "totalSupply",
    })) as bigint;

    // Calcule a quantidade de Ether que será recebida após a retirada da liquidez
    const _removeEther = (ethReserve * removeLPTokenWei) / _totalSupply;

    // Calcule a quantidade de tokens que serão recebidos após a retirada da liquidez
    const _removeToken = (tokenReserve * removeLPTokenWei) / _totalSupply;

    // Retorne os valores calculados de Ether e tokens
    return {
      _removeEther,
      _removeToken,
    };
  } catch (err) {
    console.error(err);
    return { _removeEther: BigInt(0), _removeToken: BigInt(0) };
  }
};

// Defina a interface TokenAfterRemove
interface TokenAfterRemove {
  _removeEther: bigint;
  _removeToken: bigint;
}