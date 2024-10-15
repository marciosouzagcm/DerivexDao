// Importe módulos e componentes necessários
import { useEffect, useState } from "react";
import { getExchangeAddress } from "./utils/getData";
import { createNewExchange } from "./utils/createExchange";
import { Address, isAddress } from "viem";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

//Defina a interface Props
interface Props {
  walletConnected: boolean;
  account: Address;
  exchangeAddress: Address;
  wrongNetwork: boolean;
  getExchange: () => void;
}


// Defina o componente CreateExchange
const CreateExchange: React.FC<Props> = (props) => {
  // Initialize state variables
  const [tokenAddress, setTokenAddress] = useState("");
  const [notAddress, setNotAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alreadyCreated, setAlreadyCreated] = useState(false);
  const [message, setMessage] = useState("");

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  // Efeito para verificar o endereço do token quando muda
  useEffect(() => {
    // Verifique se o endereço inserido é um endereço EVM
    isAddress(tokenAddress!) ? setNotAddress(false) : setNotAddress(true);
  }, [tokenAddress]);

  // Função para lidar com a criação de troca
  const createExchange = async () => {
    try {
      setLoading(true);

      const exchangeAddress = await getExchangeAddress(tokenAddress);
      if (exchangeAddress == ZERO_ADDRESS) {
        setAlreadyCreated(false);
        await createNewExchange(tokenAddress, props.account);
        setMessage(
          `Novo Contrato de Câmbio é criado. Está associado ao Token ${tokenAddress}`
        );
        props.getExchange();
      } else {
        setAlreadyCreated(true);
      }
      setLoading(false);
      setTokenAddress("");
    } catch (err) {
      console.error("Falha ao criar o contrato do Exchange:", err);
      setMessage("Falha ao criar o contrato do Exchange. Por favor, tente novamente.");
    } finally {
      setLoading(false);
      setTokenAddress("");
    }
  };

  //Renderizar os componentes da UI
  return (
    <div className="flex justify-center min-h-fit bg-blue-100 mt-4">
      {/* Main content container */}
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-xl">
        {props.wrongNetwork && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 my-4">
            <p className="text-center text-sm">
              Change your network to Sepolia.
            </p>
          </div>
        )}
        {/* Nota sobre manipulação de token único */}
        {/*Nota sobre manipulação de token único e atualização manual de endereço */}
        {!props.wrongNetwork && (
          <div className="text-center p-2 bg-blue-100 mb-4 rounded">
            <p className="text-xs text-gray-700">
            Observação: esta plataforma oferece suporte a um token ERC-20 ativo por vez. Em
              caso de criação de outra Exchange para um novo token, é necessário
              para atualizar manualmente o endereço do contrato do token ERC-20 no código
              para refletir a nova troca de tokens.
            </p>
          </div>
        )}
        {/* Entrada de endereço de token */}
        {!props.wrongNetwork && (
          <div>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Token Address
              </label>
              <input
                className="px-4 py-3 w-full border rounded-lg placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="Enter Token Address"
                onChange={(e) => setTokenAddress(e.target.value)}
                value={tokenAddress}
              />
              {/* Exibir um aviso se a entrada não for um endereço válido */}
              {tokenAddress && notAddress ? (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-left text-xs mt-1">
                  <p>Este endereço não é um endereço EVM. Verifique seu endereço.</p>
                </div>
              ) : null}
            </div>

            {/* Renderização condicional do botão de criação de troca */}
            {props.walletConnected ? (
              <button
                onClick={createExchange}
                className={`mt-6 w-full py-3 font-semibold rounded-lg ${
                  (notAddress)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                }`}
                disabled={notAddress}
              >
                {/* Exibir o botão giratório de carregamento ou o rótulo do botão */}
                {loading ? (
                  <AiOutlineLoading3Quarters className="animate-spin inline-block mr-2" />
                ) : (
                  <span>
                    {!notAddress
                      ? "Criar troca"
                      : "Enter Endereço do token"}
                  </span>
                )}
              </button>
            ) : (
              <button className="w-full bg-blue-200 text-blue-700 font-semibold rounded-xl py-3 mt-4 hover:bg-blue-300">
                Nenhuma carteira detectada
              </button>
            )}
            {/* Exibir um aviso se um contrato de câmbio já tiver sido criado */}
            {alreadyCreated ? (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-left text-xs mt-1">
                <p>
                Já existe um contrato de Exchange associado a este
                endereço de token.
                </p>
              </div>
            ) : null}

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
};

export default CreateExchange;