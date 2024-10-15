// Importe módulos e componentes necessários
import { useEffect, useState } from "react";
import { Address } from "viem";
import CreateExchange from "../../CreateExchange"; // Importe o componente CreateExchange
import Header from "../../Header"; //Importe o componente Cabeçalho
import Liquidity from "../../Liquidity"; // Importe o componente Liquidez
import Swap from "../../Swap"; //Importe o componente Swap
import { getExchangeAddress } from "../getData";
import "./App.css"; //Importe um arquivo CSS para estilização
export const TOKEN_CONTRACT_ADDRESS = "0x3c725134d74D5c45B4E4ABd2e5e2a109b5541288";

// Defina o componente principal do aplicativo
function App() {
  // Inicialize o estado para rastrear o estado tabnitialize ativo para rastrear a guia ativa
const [tab, setTab] = useState(() => {
  const savedTab = localStorage.getItem("currentTab");
  return savedTab || "swap";
});
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState<Address>("0x");
  const [exchangeAddress, setExchangeAddress] = useState<Address>("0x");
  const [wrongNetwork, setWrongNetwork] = useState(false);

  // Função para buscar o endereço de troca
  const getExcAddr = async () => {
    const exAddress = await getExchangeAddress(TOKEN_CONTRACT_ADDRESS);
    setExchangeAddress(exAddress);
  };

  // gancho useEffect para buscar dados de endereço de troca na montagem do componente
  useEffect(() => {
    getExcAddr();
  }, [walletConnected, account]);

  // Atualizar o armazenamento local quando a guia mudar
  useEffect(() => {
    localStorage.setItem("currentTab", tab);
  }, [tab]);

  return (
    // Renderize o layout principal do aplicativo
    <div className="min-h-screen min-w-screen bg-blue-100 p-1 font-sans">
      {/* Renderize o componente Header e passe setTab como um suporte */}
      <Header
        setTab={setTab}
        setWalletConnected={setWalletConnected}
        setAccount={setAccount}
        setWrongNetwork={setWrongNetwork}
      />

      {/* Renderizar condicionalmente o componente Swap, Liquidity ou CreateExchange com base na guia selecionada */}
      <div className="mt-2 p-2 bg-blue-100 rounded-lg">
        {tab === "swap" ? (
          <Swap
            walletConnected={walletConnected}
            account={account}
            exchangeAddress={exchangeAddress}
            wrongNetwork={wrongNetwork}
          />
        ) : tab === "liquidity" ? (
          <Liquidity
            walletConnected={walletConnected}
            account={account}
            exchangeAddress={exchangeAddress}
            wrongNetwork={wrongNetwork}
          />
        ) : tab === "create-exchange" ? (
          <CreateExchange
            walletConnected={walletConnected}
            account={account}
            exchangeAddress={exchangeAddress}
            wrongNetwork={wrongNetwork}
            getExchange={getExcAddr}
          />
        ) : null}
      </div>
    </div>
  );
}

export default App;