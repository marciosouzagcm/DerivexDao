# Objetivo Geral :

O contrato Factory funciona como o hub central do nosso DEX. Sua função principal é a criação de contratos individuais de Exchange para cada token ERC-20. Pense nisso como um registro público para todos os contratos de Exchange criados. Cada par token-exchange é único e rastreado no contrato Factory. Para essa estrutura descentralizada, se uma exchange para um token ERC-20 específico não existir, qualquer um pode configurá-la usando o contrato Factory.

## Descrição das Funções:

Cada contrato de Exchange é um reflexo direto de seu token ERC-20 associado. 
Suas principais funcionalidades podem ser divididas em dois componentes principais:

***Liquidity Pool (LP) :*** 
O contrato da Exchange mantém reservas de ETH e seu respectivo token ERC-20. Os provedores de liquidez (usuários) podem contribuir para essas reservas depositando um valor equivalente de ETH e do token ERC-20 associado. Em troca, eles recebem "tokens LP" cunhados, também conhecidos como tokens ERC-20 que rastreiam sua contribuição relativa para o pool de liquidez. O pool de liquidez atua como o formador de mercado entre o par ETH-ERC20 subjacente e uma pequena taxa (0,30%) é retirada de cada negociação e adicionada de volta às reservas do pool de liquidez quando uma negociação ocorre. Isso atua como um incentivo para os provedores de liquidez, pois eles podem ganhar taxas quando as negociações ocorrem e sacar os ganhos quando queimam seus tokens LP.

***Automated Market Maker (AMM) :*** 
O contrato de câmbio serve como facilitador de transações entre o par ETH e ERC-20, em qualquer direção. Ele permite que os usuários troquem tokens alterando as reservas de liquidez do par, impactando assim o preço do token a cada transação. Quanto maior a transação em relação ao tamanho total das reservas, mais significativo será o deslizamento de preço. 

Vale a pena notar que um ativo (por exemplo, token ERC-20) pode sofrer alterações de preço entre quando uma transação é assinada e quando é incluída em um bloco, permite a especificação de parâmetros de transação, como o valor mínimo comprado ou o valor máximo vendido, agindo de forma semelhante às ordens de limite. As transações também podem ter prazos, fornecendo um mecanismo para cancelar ordens que não são executadas com rapidez suficiente.

## Mergulhando no código:
Vamos analisá-lo para entender completamente sua funcionalidade.

### Pragmas e  Importações:


// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

// Importa o contrato Exchange que será utilizado para as trocas

import "./Exchange.sol";

}


O contrato começa especificando a versão do compilador Solidity. 
Além disso, o contrato Factory importa o contrato Exchange.

// Evento que será emitido sempre que uma nova exchange for criada

event ExchangeCreated(address indexed tokenAddress, address indexed exchangeAddress);
    
Eventos são um mecanismo para registrar atividades significativas no blockchain. Aqui, o **ExchangeCreated** evento é emitido toda vez que um novo contrato de troca é criado. 
Isso ajuda dApps e entidades externas a ouvir e reagir a esse evento.

### Mapeamentos:

contract DerivexFactory {

    // Mapeia o endereço de um token para o endereço da respectiva exchange
    mapping(address => address) public tokenToExchange;
    
    // Mapeia o endereço de uma exchange para o token correspondente
    mapping(address => address) public exchangeToToken;
    
    // Mapeia um ID único para um token específico
    mapping(uint256 => address) public idToToken;

- tokenToExchange: Mapeia o endereço do token para o endereço da exchange associada.
- exchangeToToken: Mapeia o endereço da exchange para o token correspondente.
- idToToken: Opcionalmente, você pode associar um ID único a um token, útil se quiser identificar tokens de forma numérica.

### Criando uma troca:

 // Evento que será emitido sempre que uma nova exchange for criada
    event ExchangeCreated(address indexed tokenAddress, address indexed exchangeAddress);

Sempre que uma nova exchange é criada, o evento ExchangeCreated é emitido, registrando o endereço do token e o da exchange na blockchain. 
Isso permite monitorar e auditar todas as exchanges criadas.

    // Função para criar uma nova exchange associada a um token
    function createNewExchange(address _tokenAddress) public returns (address) {
        // Verifica se o endereço do token é válido
        require(_tokenAddress != address(0), "Endereco do token invalido");
        // Garante que não existe já uma exchange para esse token
        require(tokenToExchange[_tokenAddress] == address(0), "A exchange ja existe para este token");

        // Cria uma nova exchange associada ao token
        Exchange exchange = new Exchange(_tokenAddress);
        // Adiciona a nova exchange ao array
        exchangeArray.push(exchange);
        // Mapeia o token para a nova exchange
        tokenToExchange[_tokenAddress] = address(exchange);
        // Mapeia a exchange para o token correspondente
        exchangeToToken[address(exchange)] = _tokenAddress;

        // Emite o evento de criação de uma nova exchange
        emit ExchangeCreated(_tokenAddress, address(exchange));

        // Retorna o endereço da nova exchange
        return address(exchange);
    }

A createNewExchange função facilita a criação de um novo contrato de troca para um token fornecido. Ela verifica se o endereço do token é válido e se o endereço para o token ERC-20 fornecido já existe. Então, o contrato Factory cria uma nova instância do Exchange contrato com o endereço do token fornecido. Depois, o novo endereço de troca e seu token associado são armazenados nos respectivos mapeamentos e exchangeArray. No final, o ExchangeCreated evento é emitido e o endereço de troca do contrato recém-criado é retornado.

### Funções de Consulta:

 // Função para consultar a exchange associada a um token
    function getExchange(address _tokenAddress) public view returns (address) {
        return tokenToExchange[_tokenAddress];
    }

    // Função para consultar o token associado a uma exchange
    function getToken(address _exchange) public view returns (address) {
        return exchangeToToken[_exchange];
    }

    // Função para consultar o token associado a um ID específico
    function getTokenWithId(uint256 _tokenId) public view returns (address) {
        return idToToken[_tokenId];

- getExchange: Retorna o endereço da exchange associada a um token específico.
- getToken: Retorna o token associado a uma exchange específica.
- getTokenWithId: Permite consultar o token associado a um ID numérico.

