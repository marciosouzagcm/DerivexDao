// Importe módulos e componentes necessários
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { HiOutlineChevronDoubleLeft, HiPlus } from "react-icons/hi";
import { Address, formatEther, parseEther } from "viem";
import { addLiquidity, calculateToken } from "./utils/addLiquidity";
import { TOKEN_CONTRACT_ADDRESS } from "./utils/constants";
import {
    getEtherBalance,
    getReserveOfToken,
    getTokenBalance,
    getTokenData,
} from "./utils/getData";

interface AddLiquidityProps {
  goBack: (value: boolean) => void;
  getLpAmount: () => void;
  walletConnected: boolean;
  account: Address;
  exchangeAddress: Address;
  wrongNetwork: boolean;
}

// Defina o componente principal
function AddLiquidity(props: AddLiquidityProps) {
  // Inicializar variáveis ​​de estado
  const zero = BigInt(0);
  const [secondToken, setSecondToken] = useState("");
  const [showEthBal, setShowEthBal] = useState("");
  const [showTokenBal, setShowTokenBal] = useState("");
  const [firstValue, setFirstValue] = useState("");
  const [secondValue, setSecondValue] = useState("");
  const [ethReserve, setEthReserve] = useState(zero);
  const [tokenReserve, setTokenReserve] = useState(zero);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const firstToken = "ETH";
  // Função para obter quantidade de LP
  const getLpAmount = () => {
    props.getLpAmount();
  };

  // gancho useEffect para buscar saldos de contas e valores de reserva
  useEffect(() => {
    (async () => {
      getAmounts();
      getLpAmount();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, props.account, props.walletConnected, props.wrongNetwork]);

  // gancho useEffect para obter o símbolo do token
  useEffect(() => {
    getTokenSymbol(TOKEN_CONTRACT_ADDRESS);
  }, []);

  //Função para obter o símbolo do token
  const getTokenSymbol = async (address: Address) => {
    const _symbol = await getTokenData(address);
    setSecondToken(_symbol);
  };

  // Função para buscar saldos e valores de reserva
  const getAmounts = async () => {
    const _ethBalance = await getEtherBalance(props.account);
    const _tokenBalance = await getTokenBalance(props.account);
    const _ethReserve = await getEtherBalance(props.exchangeAddress);
    const _tokenReserve = await getReserveOfToken(props.exchangeAddress);

    setEthReserve(_ethReserve);
    setTokenReserve(_tokenReserve);

    const showEth = parseFloat(formatEther(_ethBalance)).toFixed(5);
    const showToken = parseFloat(formatEther(_tokenBalance)).toFixed(5);
    setShowEthBal(showEth);
    setShowTokenBal(showToken);
  };

  // Função para atualizar o segundo valor com base no primeiro valor
  const toAdd = async (value: string) => {
    setFirstValue(value);
    setMessage("");

    try {
      if (ethReserve !== zero && tokenReserve !== zero) {
        const amountToAdd = await calculateToken(
          value,
          ethReserve,
          tokenReserve
        );
        setSecondValue(formatEther(amountToAdd));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Função para lidar com a adição de liquidez
  const onLiquidity = async () => {
    try {
      setLoading(true);
      const etherAmountWei = parseEther(firstValue);
      const tokenAmountWei = parseEther(secondValue);

      await addLiquidity(
        tokenAmountWei,
        etherAmountWei,
        props.account,
        props.exchangeAddress
      );
      toAdd("");
      setLoading(false);
      setFirstValue("");
      setSecondValue("");
      setMessage(
        `${firstValue} ${firstToken} and ${parseFloat(
          formatEther(tokenAmountWei)
        ).toFixed(5)} ${secondToken} are added to the liquidity pool.`
      );
    } catch (err) {
      console.error("Failed to add liquidity:", err);
      setMessage("Failed to add liquidity. Please try again.");
    } finally {
      setLoading(false);
      setFirstValue("");
      setTimeout(() => {
        goBack(false);
      }, 1000);
    }
  };

  // Função para voltar à tela anterior
  const goBack = (value: boolean) => {
    props.goBack(value);
  };

  // Render the UI components
  return (
    <div className="flex justify-center min-h-fit bg-blue-100 mt-4">
      {/* Este é um contêiner que centraliza o conteúdo e define a altura mínima. */}
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-xl">
        {props.wrongNetwork && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 my-4">
            <p className="text-center text-sm">
              Change your network to Sepolia.
            </p>
          </div>
        )}

        {!props.wrongNetwork && (
          <div>
            {/* Este é um botão que volta para a tela anterior. */}
            <button onClick={() => goBack(false)} className="text-2xl mb-4">
              <HiOutlineChevronDoubleLeft />
            </button>
            {/* Este é um contêiner que contém os campos de entrada para o primeiro e o segundo tokens. */}
            <div className="mb-4">
              {/* Este é um campo de entrada para o primeiro token. */}
              <input
                className="px-4 py-3 w-full border rounded-lg placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="0.0"
                onChange={(e) => toAdd(e.target.value)}
                value={firstValue}
              />
              {/* Este é um rótulo para o primeiro token */}
              <div className="mt-2 text-sm text-gray-600">{firstToken}</div>
              {/* Este é um campo de texto que mostra o saldo do primeiro token. */}
              <div className="mt-1 text-xs text-gray-400">
                {showEthBal ? showEthBal + " " + firstToken : "0.0"}
              </div>
            </div>
            {/* Este é um contêiner que contém um sinal de mais e uma divisória. */}
            <div className="flex items-center justify-center">
              <span className="bg-blue-100 p-3 rounded-lg">
                <HiPlus />
              </span>
            </div>
            {/* Este é um contêiner que contém o campo de entrada do segundo token. */}
            <div className="mt-4">
              {/* Este é um campo de entrada para o segundo token. */}
              <input
                className="px-4 py-3 w-full border rounded-lg placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="0.0"
                disabled={ethReserve !== zero}
                onChange={
                  ethReserve === zero
                    ? (e) => setSecondValue(e.target.value)
                    : undefined
                }
                value={secondValue}
              />
              {/* Este é um rótulo para o segundo token. */}
              <div className="mt-2 text-sm text-gray-600">{secondToken}</div>
              {/* Este é um campo de texto que mostra o saldo do segundo token. */}
              <div className="mt-1 text-xs text-gray-400">
                {showTokenBal ? showTokenBal + " " + secondToken : "0.0"}
              </div>
            </div>
            {/* Este é um botão que aprova e adiciona liquidez. */}
            {props.walletConnected ? (
              <button
                onClick={onLiquidity}
                className={`mt-6 w-full py-3 font-semibold rounded-lg ${
                  parseFloat(firstValue) > parseFloat(showEthBal) ||
                  parseFloat(secondValue) > parseFloat(showTokenBal)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                }`}
                disabled={
                  parseFloat(firstValue) > parseFloat(showEthBal) ||
                  parseFloat(secondValue) > parseFloat(showTokenBal)
                }
              >
                {loading ? (
                  <AiOutlineLoading3Quarters className="animate-spin inline-block mr-2" />
                ) : (
                  <span>
                    {parseFloat(firstValue) > parseFloat(showEthBal) ||
                    parseFloat(secondValue) > parseFloat(showTokenBal)
                      ? "Insufficient balance"
                      : "Approve & Add Liquidity"}
                  </span>
                )}
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
                  message.startsWith("Failed")
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
}

export default AddLiquidity;