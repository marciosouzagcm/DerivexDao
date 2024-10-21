// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// Importa o ERC20 da OpenZeppelin para tokens de liquidez (LP tokens)
import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; 
// Importa ReentrancyGuard da OpenZeppelin para prevenir ataques de reentrância
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; 

// O contrato Exchange facilita a troca de ETH e tokens DVX e a gestão de liquidez
// Seguindo as melhores práticas em design modular, reentrância, controle de acesso e otimização de gás
contract Exchange is ERC20, ReentrancyGuard {
    
    // Endereço do token DVX usado nas trocas
    address immutable tokenAddress; 
    // Endereço do contrato Factory que cria esta Exchange
    address immutable factoryAddress;

    // Eventos para registrar atividades importantes de liquidez e swaps
    event LiquidityAdded(address indexed provider, uint ethAmount, uint tokenAmount);
    event LiquidityRemoved(address indexed provider, uint ethAmount, uint tokenAmount);
    event TokenPurchased(address indexed buyer, uint ethAmount, uint tokensReceived);
    event TokenSold(address indexed seller, uint tokensSold, uint ethReceived);

    // **Construtor**
    // Inicializa o contrato com o token DVX e o Factory, e define os tokens de liquidez como DVX-LP
    constructor(address _tokenAddress) ERC20("DVX-LP", "DVX-LP") {
        require(_tokenAddress != address(0), "0xDA07165D4f7c84EEEfa7a4Ff439e039B7925d3dF");  // Evita endereços invalidos
        tokenAddress = _tokenAddress;  
        factoryAddress = msg.sender;  // Define o contrato Factory que criou esta Exchange
    }

    // **Função getTokenReserves**
    // Retorna as reservas de tokens DVX presentes na pool
    function getTokenReserves() public view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));  // Consulta o saldo de tokens DVX na pool
    }

    // **Função getTokenAmount**
    // Calcula quantos tokens DVX o utilizador recebe ao vender ETH
    function getTokenAmount(uint ethSold) public view returns (uint256) {
        require(ethSold > 0, "ETH sold must be greater than 0");
        uint outputReserve = getTokenReserves();
        return getAmount(ethSold, address(this).balance - ethSold, outputReserve);
    }

    // **Função getEthAmount**
    // Calcula quanto ETH o utilizador recebe ao vender tokens DVX
    function getEthAmount(uint tokensSold) public view returns (uint256) {
        require(tokensSold > 0, "Tokens sold must be greater than 0");
        uint inputReserve = getTokenReserves();
        return getAmount(tokensSold, inputReserve - tokensSold, address(this).balance);
    }

    // **Função getAmount** (Design Modular)
    // Função auxiliar para calcular o valor de trocas (ETH -> tokens ou tokens -> ETH), aplicando uma taxa de 0,3%
    function getAmount(uint inputAmount, uint inputReserve, uint outputReserve) public pure returns (uint256) {
        require(inputReserve > 0 && inputAmount > 0, "Invalid values provided");
        uint256 inputAmountWithFee = inputAmount * 997;  // Aplica a taxa de 0,3%
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 1000) + inputAmountWithFee;
        return numerator / denominator;
    }

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