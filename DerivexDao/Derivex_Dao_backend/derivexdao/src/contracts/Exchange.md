# Contrato Exchange.sol:

O contrato Exchange é o coração do seu Derivex DAO no que diz respeito à facilitação de swaps (troca de tokens) e à gestão de reservas de liquidez . 
Este contrato é semelhante ao que exchanges descentralizadas como Uniswap utilizam para administrar pools de liquidez e trocas de tokens . 
A arquitetura do contrato parece bem estruturada para lidar com essas funcionalidades essenciais.
A utilização de tokens de liquidez ( DVX ) também incentiva a comunidade a fornecer liquidez, beneficiando-se das taxas de transação.

## Função do Contrato Exchange :

### Facilitação de Swaps (Troca de Tokens e funções de preço) :

A função ***swapEthForTokens*** permite que os usuários troquem ETH por tokens (derivativos ou de governança).

Isso é crucial para o objetivo da Derivex DAO de criar um mercado automatizado para tokens de derivativos.

### Gestão de Liquidez :

Cada contrato de Exchange é um reflexo direto de seu token ERC-20 associado. Suas principais funcionalidades podem tem como componentes:

***Liquidity Pool (LP):*** 

O contrato da Exchange mantém reservas de ETH e seu respectivo token ERC-20. Os provedores de liquidez (usuários) podem contribuir para essas reservas depositando um valor equivalente de ETH e do token ERC-20 associado. Em troca, eles recebem "tokens LP" cunhados, também conhecidos como tokens ERC-20 que rastreiam sua contribuição relativa para o pool de liquidez. 
O pool de liquidez atua como o formador de mercado entre o par ETH-ERC20 subjacente e uma pequena taxa (0,30%) é retirada de cada negociação e adicionada de volta às reservas do pool de liquidez quando uma negociação ocorre. Isso atua como um incentivo para os provedores de liquidez, pois eles podem ganhar taxas quando as negociações ocorrem e sacar os ganhos quando queimam seus tokens LP.

***Automated Market Maker (AMM):*** 

O contrato de câmbio serve como facilitador de transações entre o par ETH e ERC-20, em qualquer direção. Ele permite que os usuários troquem tokens alterando as reservas de liquidez do par, impactando assim o preço do token a cada transação. Quanto maior a transação em relação ao tamanho total das reservas, mais significativo será o deslizamento de preço.
Utilizam algoritmos e pools de liquidez para determinar preços de negociação, não precisar de um livro de ordens tradicional. 
Em vez disso, eles contam com contratos inteligentes para calcular automaticamente os preços de negociação com base em um algoritmo predeterminado e na proporção de tokens em um pool de liquidez. 
AMMs não exigem que compradores e vendedores sejam correspondidos diretamente; isso os torna mais eficientes do que as trocas tradicionais de livros de ordens.

**Function getAmount** implementa uma taxa de 0,3%, que é comum em pools de liquidez para provedores de crédito.

### Eventos e Transparência :

Eventos como **LiquidityAdded** , **LiquidityRemoved** , **TokenPurchased** , e **TokenSold** garantem transparência, permitindo que a comunidade da Derivex DAO acompanhe todas as operações de negociação.

## Análise preliminar do Contrato :


Pragma e importações 
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// Importa o ERC20 da OpenZeppelin para tokens de liquidez (LP tokens)
import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; 
// Importa ReentrancyGuard da OpenZeppelin para prevenir ataques de reentrância
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; 

Variáveis de estado

// Endereço do token DVX usado nas trocas
    address immutable tokenAddress; 
    // Endereço do contrato Factory que cria esta Exchange
    address immutable factoryAddress;
    
Então, sob as variáveis ​​de estado, vamos adicionar os eventos abaixo.

    // Eventos para registrar atividades importantes de liquidez e swaps
    event LiquidityAdded(address indexed provider, uint ethAmount, uint tokenAmount);
    event LiquidityRemoved(address indexed provider, uint ethAmount, uint tokenAmount);
    event TokenPurchased(address indexed buyer, uint ethAmount, uint tokensReceived);
    event TokenSold(address indexed seller, uint tokensSold, uint ethReceived);


### 1. Construtor:

**Function constructor(address _tokenAddress):**

// Inicializa o contrato com o token DVX e o Factory, e define os tokens de liquidez como DVX-LP
    constructor(address _tokenAddress) ERC20("DVX-LP", "DVX-LP") {
        require(_tokenAddress != address(0), "endereço do contrato");  // Evita endereços invalidos
        tokenAddress = _tokenAddress;  
        factoryAddress = msg.sender;  // Define o contrato Factory que criou esta Exchange
    }

Inicializa o contrato com o endereço do token DVX e configura DVX . 

**Function factoryAddress** 
É o endereço do contrato de Fábrica.

**Function tokenAddress:** 
Este é o endereço do token que será trocado na exchange. Ele é imutável, garantindo que a exchange só suporte um token específico.

**Function factoryAddress:**
É o endereço do contrato de fábrica que cria essa troca, garantindo rastreamento da origem.

***ERC20("DVX", DVX):*** 

Uma exchange cria tokens de liquidez, que são distribuídos a quem adiciona liquidez. Esses tokens representam a participação do usuário no pool.

### 2. Adicionar e remover líquidez :

**Function addLiquidity** e **Function removeLiquidity**


// **Função addLiquidity** (ReentrancyGuard + Controle de Acesso)
    // Permite que os utilizadores adicionem liquidez à pool e recebam tokens de liquidez (DVX-LP)
    function addLiquidity(uint tokensAdded) external payable nonReentrant returns (uint256) {
        require(msg.value > 0 && tokensAdded > 0, "Invalid values provided");  // Tratamento de erros com require
        uint ethBalance = address(this).balance;
        uint tokenBalance = getTokenReserves();

        if (tokenBalance == 0) {
            // Primeira adição de liquidez
            require(IERC20(tokenAddress).balanceOf(msg.sender) >= tokensAdded, "Insufficient token balance");
            IERC20(tokenAddress).transferFrom(msg.sender, address(this), tokensAdded);  // Transferencia dos tokens DVX
            uint liquidity = ethBalance;
            _mint(msg.sender, liquidity);  // Emite tokens de liquidez (DVX-LP)
            emit LiquidityAdded(msg.sender, msg.value, tokensAdded);  // Emite evento
            return liquidity;
        } else {
            // Adições subsequentes de liquidez
            uint liquidity = (msg.value * totalSupply()) / (ethBalance - msg.value);
            require(IERC20(tokenAddress).balanceOf(msg.sender) >= tokensAdded, "Insufficient token balance");
            IERC20(tokenAddress).transferFrom(msg.sender, address(this), tokensAdded);
            _mint(msg.sender, liquidity);  // Emite tokens de liquidez (DVX-LP)
            emit LiquidityAdded(msg.sender, msg.value, tokensAdded);  // Emite evento
            return liquidity;
        }
    }
    
    // **Função removeLiquidity** (ReentrancyGuard + Tratamento de Erros)
    // Permite remover liquidez da pool e queima os tokens de liquidez (DVX-LP)
    function removeLiquidity(uint256 tokenAmount) external nonReentrant returns (uint, uint) {
        require(tokenAmount > 0, "Invalid token amount");

        uint ethAmount = (address(this).balance * tokenAmount) / totalSupply();  // Calcula quanto ETH o utilizador recebe
        uint tokenAmt = (getTokenReserves() * tokenAmount) / totalSupply();  // Calcula quantos tokens DVX o utilizador recebe

        _burn(msg.sender, tokenAmount);  // Queima os tokens de liquidez (DVX-LP)
        payable(msg.sender).transfer(ethAmount);  // Transfere ETH para o utilizador
        IERC20(tokenAddress).transfer(msg.sender, tokenAmt);  // Transfere tokens DVX para o utilizador

        emit LiquidityRemoved(msg.sender, ethAmount, tokenAmt);  // Emite evento
        return (ethAmount, tokenAmt);
    }

As funções de liquidez ( addLiquiditye removeLiquidity) fazem o seguinte:

**Function addLiquidity:** 
Permite que um usuário adicione liquidez à exchange depositando ETH e tokens. O usuário especifica liquidez mínima, tokens máximos e um prazo como parâmetros de entrada. A função primeiro verifica se a exchange já tem liquidez. Se sim, ela calcula o valor do token e a liquidez a ser cunhada com base nas reservas existentes e adiciona a liquidez cunhada ao saldo do remetente. Se não houver liquidez, a função define a liquidez inicial igual ao saldo do contrato. A função emite eventos para adicionar liquidez e para a transferência da liquidez cunhada.

**Function removeLiquidity:** 
Permite que um usuário remova liquidez da exchange especificando uma quantia de liquidez a ser removida, ETH mínimo, tokens mínimos e um prazo. A função calcula a quantia de ETH e tokens a serem retornados com base na liquidez total e na contribuição do usuário. Ela atualiza o saldo do remetente e o suprimento total de liquidez. A função então transfere o ETH e os tokens de volta para o usuário e emite eventos para remover liquidez e para a transferência da liquidez removida.

### 4. Funções de Swap (Troca de Tokens) :

// **Função swapEthForTokens** (Otimização de Gás + ReentrancyGuard)
    // Troca ETH por tokens DVX, garantindo que o utilizador receba pelo menos o mínimo especificado de tokens
    function swapEthForTokens(uint minTokens, address recipient) external payable nonReentrant returns (uint) {
        uint tokenAmount = getTokenAmount(msg.value);  // Calcula quantos tokens DVX o utilizador receberá
        require(tokenAmount >= minTokens, "Token amount less than expected");

        IERC20(tokenAddress).transfer(recipient, tokenAmount);  // Transfere tokens DVX para o destinatário
        emit TokenPurchased(msg.sender, msg.value, tokenAmount);  // Emite evento de compra de tokens
        return tokenAmount;
    }

    // **Função tokenForEthSwap** (Tratamento de Erros + ReentrancyGuard)
    // Troca tokens DVX por ETH, garantindo que o utilizador receba pelo menos o mínimo especificado de ETH
    function tokenForEthSwap(uint tokensSold, uint minEth) external nonReentrant returns (uint) {
        uint ethAmount = getEthAmount(tokensSold);  // Calcula quanto ETH o utilizador receberá
        require(ethAmount >= minEth, "ETH amount less than expected");

        IERC20(tokenAddress).transferFrom(msg.sender, address(this), tokensSold);  // Transfere tokens DVX para a pool
        payable(msg.sender).transfer(ethAmount);  // Transfere ETH de volta ao utilizador
        emit TokenSold(msg.sender, tokensSold, ethAmount);  // Emite evento de venda de tokens
        return ethAmount;
    }
}


**Function swapEthForTokens:** Esta função permite que os usuários troquem Ethereum (ETH) por tokens. O usuário envia uma quantia específica de ETH e recebe um número calculado de tokens em troca. O número de tokens recebidos deve ser maior ou igual a minTokens, caso contrário, a função lançará um erro. Os tokens comprados são então transferidos para o destinatário.

**Function tokenForEthSwap:** Esta função permite que os usuários troquem tokens por Ethereum (ETH). O usuário especifica a quantidade de tokens que deseja vender e, em troca, recebe uma quantidade calculada de ETH. A quantidade de ETH deve ser maior ou igual a minEth, caso contrário, a função lançará um erro. Os tokens vendidos são transferidos do endereço do usuário para o endereço do contrato.

### 5. Proteções contra Ataques de Reentrância :

// O contrato Exchange facilita a troca de ETH e tokens DVX e a gestão de liquidez
// Seguindo as melhores práticas em design modular, reentrância, controle de acesso e otimização de gás
contract Exchange is ERC20, ReentrancyGuard {
