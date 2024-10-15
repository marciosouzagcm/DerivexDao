// Importe módulos e componentes necessários
import { useState, useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Address } from "viem";
import { sepolia } from "viem/chains";
import { walletClient } from "./utils/client";

// Defina a interface HeaderProps
interface HeaderProps {
  setTab: React.Dispatch<React.SetStateAction<string>>;
  setWalletConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setAccount: React.Dispatch<React.SetStateAction<Address>>;
  setWrongNetwork: React.Dispatch<React.SetStateAction<boolean>>;
}

// Função para encurtar o endereço exibido (por exemplo, 0xabcd...abcd)
function shortAddress(_address: Address) {
  return _address.substring(0, 6) + "..." + _address.slice(-4);
}

// Componente de cabeçalho
const Header: React.FC<HeaderProps> = (props) => {
  // Inicializar variáveis ​​de estado
  const [tab, setTab] = useState(() => {
    const savedTab = localStorage.getItem("currentTab");
    return savedTab || "swap";
  });
  const [account, setAccount] = useState<Address>("0x");
  const [wrongNetwork, setWrongNetwork] = useState(false);

  // Função para conectar a carteira
  const connectWallet = async () => {
    try {
      // Conectar à carteira
      const [address] = await walletClient.requestAddresses();
      setAccount(address);
      props.setAccount(address);
      props.setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const disconnectWallet = () => {
    setAccount("0x"); // Redefinir a conta
    props.setWalletConnected(false); // Atualizar o estado do componente pai
    props.setAccount("0x"); //Redefinir a conta no componente pai
  };

  // Função para obter endereço conectado
  const getConnectedAddress = async () => {
    try {
      const [address] = await walletClient.getAddresses();
      if (address == undefined) {
        return;
      }
      setAccount(address);
      props.setAccount(address);
      props.setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Função para detectar se a carteira se conecta a outro blockchain
  const getConnectedChain = async () => {
    try {
      const chainIdClient = await walletClient.getChainId();
      if (chainIdClient !== undefined) {
        const isWrongNetwork = chainIdClient != sepolia.id;
        setWrongNetwork(isWrongNetwork);
        props.setWrongNetwork(isWrongNetwork); // Atualizar estado no nível do aplicativo
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Função para lidar com a mudança de aba
  const handleTab = (newTab: string) => {
    setTab(newTab);
    props.setTab(newTab);
  };

  // Atualize a guia quando walletConnected for alterado
  useEffect(() => {
    props.setTab(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.setWalletConnected]);

  //Conecte a carteira na montagem do componente
  useEffect(() => {
    getConnectedAddress();
    getConnectedChain();

    if (typeof window.ethereum !== "undefined") {
      //O usuário tem o Metamask instalado e habilitado
      window.ethereum.on("accountsChanged", getConnectedAddress);
      window.ethereum.on("chainChanged", getConnectedChain);
    } else {
      console.log("Install browser-based wallet (i.e., Metamask)");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Renderizar os componentes da UI
  return (
    <div className="py-4 px-6 bg-white shadow-md">
      <HelmetProvider>
        <Helmet>
          <title>DeFi Course DEX</title>
          <meta name="description" content="DeFi Course DEX" />
          <link rel="icon" href="/favicon.ico" />
        </Helmet>
      </HelmetProvider>

      <p className="text-lg font-semibold">DeFi Course DEX</p>

      <div className="flex justify-between items-center">
        {/* Este é um contêiner que contém as guias e o botão de conexão da carteira. */}
        <div className="flex lg:flex-row">
          {/* Este é um wrapper que torna o botão de conexão da carteira responsivo. */}
          <div className="lg:relative lg:w-fit">
            {/* Este é um contêiner que contém as três guias. */}
            <div className="flex flex-row py-1 space-x-6 text-blue-500 text-lg ">
              {/* Este é um botão que abre a guia de criação de troca. */}
              <button
                onClick={() => handleTab("create-exchange")}
                className={
                  tab === "create-exchange"
                    ? "font-semibold underline"
                    : "font-semibold"
                }
              >
                Create Exchange
              </button>
              {/* Este é um botão que abre a aba de liquidez. */}
              <button
                onClick={() => handleTab("liquidity")}
                className={
                  tab === "liquidity"
                    ? "font-semibold underline"
                    : "font-semibold"
                }
              >
                Liquidity
              </button>
              {/* Este é um botão que abre a aba de troca. */}
              <button
                onClick={() => handleTab("swap")}
                className={
                  tab === "swap" ? "font-semibold underline" : "font-semibold"
                }
              >
                Swap
              </button>
            </div>
          </div>
        </div>
        {/* Este é um contêiner que contém a mensagem de aviso e o botão de conexão da carteira. */}
        <div className="flex flex-row space-x-4">
          {/* Esta é uma mensagem de aviso que será exibida se a rede não for Sepolia. */}
          <div
            className={`bg-yellow-100 border-l-4 border-yellow-500 p-4 ${
              wrongNetwork ? "block" : "hidden"
            }`}
          >
            <p className="text-xs">Change your network to Sepolia.</p>
          </div>
          {/*Este é um botão que conecta a carteira ao DEX. */}
          <button
            onClick={connectWallet}
            className="bg-blue-200 px-3 py-2 rounded-xl text-blue-500 hover:bg-blue-300"
          >
            {account.length > 40 ? shortAddress(account) : "Connect Wallet"}
          </button>
          {account !== "0x" && (
            <button
              onClick={disconnectWallet}
              className="bg-red-200 px-3 py-2 rounded-xl text-red-500 hover:bg-red-300"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

Header.displayName = "Header";

export default Header;