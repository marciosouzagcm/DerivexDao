// Importe módulos e componentes necessários
import { useEffect, useState } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { formatEther, parseEther, Address } from "viem";
import { TOKEN_CONTRACT_ADDRESS } from "./utils/constants";

import {
  getEtherBalance,
  getTokenBalance,
  getTokenData,
} from "./utils/getData";

import { getAmountOfTokensReceivedFromSwap, swapTokens } from "./utils/swap";

// Defina a interface SwapProps
interface SwapProps {
  walletConnected: boolean;
  account: Address;
  exchangeAddress: Address;
  wrongNetwork: boolean;
}

// Defina o componente Swap
const Swap: React.FC<SwapProps> = (props) => {
  // Initialize state variables
  const zero = BigInt(0);
  const [firstToken, setFirstToken] = useState("ETH");
  const [secondToken, setSecondToken] = useState("");
  const [showEthBal, setShowEthBal] = useState("");
  const [showTokenBal, setShowTokenBal] = useState("");
  const [firstValue, setFirstValue] = useState("");
  const [secondValue, setSecondValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [flip, setFlip] = useState(false);
  const [message, setMessage] = useState("");

  //gancho useEffect para buscar dados na montagem do componente
  useEffect(() => {
    (async () => {
      getAmounts();
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, props.walletConnected, props.account, props.wrongNetwork]);

  // gancho useEffect para obter o símbolo do token
  useEffect(() => {
    getTokenSymbol(TOKEN_CONTRACT_ADDRESS);
  }, []);

  // Função para obter o símbolo do token
  const getTokenSymbol = async (address: Address) => {
    const _symbol = await getTokenData(address);
    setSecondToken(_symbol);
  };

  // Função para buscar valores da carteira
  const getAmounts = async () => {
    const _ethBalance = await getEtherBalance(props.account);
    const _tokenBalance = await getTokenBalance(props.account);

    // Calcular e exibir saldos
    const showEth = parseFloat(formatEther(_ethBalance)).toFixed(5);
    const showToken = parseFloat(formatEther(_tokenBalance)).toFixed(5);
    if (flip) {
      setShowEthBal(showToken);
      setShowTokenBal(showEth);
    } else {
      setShowEthBal(showEth);
      setShowTokenBal(showToken);
    }
  };

  // Função para lidar com o processo de troca
  const onSwap = async () => {
    try {
      setLoading(true);
      const firstValueInWei = parseEther(firstValue);
      const secondValueInWei = parseEther(secondValue);

      if (firstToken == "ETH") {
        if (firstValue) {
          await swapTokens(
            true,
            firstValueInWei,
            secondValueInWei,
            props.account,
            props.exchangeAddress
          );
        }
      } else {
        await swapTokens(
          false,
          firstValueInWei,
          secondValueInWei,
          props.account,
          props.exchangeAddress
        );
      }
      setMessage(
        `${firstValue} ${firstToken} swapped to ${parseFloat(
          formatEther(secondValueInWei)
        ).toFixed(5)} ${secondToken}`
      );
      setLoading(false);
      setFirstValue("");
      setSecondValue("");
    } catch (err) {
      setLoading(false);
      setFirstValue("");
      setSecondValue("");
      console.error(err);
    }
  };

  // Função para calcular tokens recebidos após troca
  const toReceive = async (value: string) => {
    setFirstValue(value);
    setMessage("");

    try {
      const valueToWei = parseEther(value);
      if (valueToWei !== zero) {
        if (firstToken == "ETH") {
          const amountToReceive = await getAmountOfTokensReceivedFromSwap(
            true,
            valueToWei,
            props.exchangeAddress
          );
          setSecondValue(formatEther(amountToReceive));
        } else {
          const amountToReceive = await getAmountOfTokensReceivedFromSwap(
            false,
            valueToWei,
            props.exchangeAddress
          );
          setSecondValue(formatEther(amountToReceive));
        }
      }
    } catch (err) {
      console.error(err);
      setMessage(
        "Erro ao calcular tokens recebidos. Por favor, tente novamente ou diminua o valor da entrada."
      ); // Definir mensagem de erro para a IU
    }
  };

  // Função para lidar com a inversão de tokens
  const onFlip = () => {
    setFlip(!flip);
    setFirstToken(secondToken);
    setSecondToken(firstToken);
    setFirstValue(secondValue);
    setSecondValue(firstValue);
    setShowEthBal(showTokenBal);
    setShowTokenBal(showEthBal);
  };

  // Renderizar os componentes da UI
  return (
    <div className="flex justify-center">
      {/* Container for the main content */}
      <div className="w-3/4 bg-white p-6 rounded-xl shadow-md mt-14 lg:w-1/2 lg:mt-4">
        {/* Input section for the first value */}

        {props.wrongNetwork && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 my-4">
            <p className="text-center text-sm">
              Change your network to Sepolia.
            </p>
          </div>
        )}

        {!props.wrongNetwork && (
          <div>
            <div className="flex flex-row bg-white p-4 rounded-xl border border-gray-300">
              <input
                className="bg-transparent px-3 focus:outline-none w-full text-lg font-semibold"
                placeholder="Enter amount"
                onChange={(e) => toReceive(e.target.value)}
                value={firstValue}
              />
              <div className="flex flex-col w-1/6">
                <div className="flex flex-row bg-blue-100 m-auto px-3 py-1 rounded-xl">
                  <span className="text-lg mt-0">{firstToken}</span>
                </div>
                <span className="text-xs m-auto">
                  {showEthBal ? showEthBal + " " + firstToken : "0.0"}
                </span>
              </div>
            </div>
            {/* Button to trigger a value flip */}
            <div className="flex justify-center my-4">
              <button
                onClick={onFlip}
                className="bg-gray-100 p-2 rounded-xl text-xl text-blue-500 hover:bg-gray-200"
              >
                <HiOutlineRefresh />
              </button>
            </div>
            {/* Input section for the second value */}
            <div className="flex flex-row bg-white p-4 rounded-xl border border-gray-300">
              <input
                className="bg-transparent px-3 focus:outline-none w-full text-lg font-semibold"
                placeholder="0.0"
                disabled={true}
                onChange={(e) => setSecondValue(e.target.value)}
                value={secondValue}
              />
              <div className="flex flex-col w-1/6">
                <div className="bg-blue-100 m-auto px-3 py-1 rounded-xl">
                  <span className="text-lg mt-0">{secondToken}</span>
                </div>
                <span className="text-xs m-auto">
                  {showTokenBal ? showTokenBal + " " + secondToken : "0.0"}
                </span>
              </div>
            </div>
            {/* Conditional rendering of the swap button */}
            {props.walletConnected ? (
              <button
                onClick={onSwap}
                className={`flex justify-center w-full py-3 mt-4 font-semibold rounded-xl ${
                  parseFloat(firstValue) > parseFloat(showEthBal)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                disabled={parseFloat(firstValue) > parseFloat(showEthBal)}
              >
                <span className="mr-2">
                  {parseFloat(firstValue) > parseFloat(showEthBal)
                    ? "Insufficient balance"
                    : firstToken === "ETH"
                    ? "Swap"
                    : "Approve & Swap"}
                </span>
                <svg
                  className={
                    loading
                      ? "animate-spin h-5 w-5 font-bold"
                      : "animate-spin h-5 w-5 font-bold hidden"
                  }
                  viewBox="0 0 16 16"
                >
                  <AiOutlineLoading3Quarters />
                </svg>
              </button>
            ) : (
              <button className="w-full bg-blue-200 text-blue-700 font-semibold rounded-xl py-3 mt-4 hover:bg-blue-300">
                No wallet detected
              </button>
            )}
            {/* Exibição de mensagem para sucesso ou erro */}
            {message && (
              <div
                className={`bg-${
                  message.startsWith("Error")
                    ? "red-100 border-red-500 text-red-700"
                    : "green-100 border-green-500 text-green-700"
                } p-4 mt-4 text-left`}
              >
                <p>{message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Swap;