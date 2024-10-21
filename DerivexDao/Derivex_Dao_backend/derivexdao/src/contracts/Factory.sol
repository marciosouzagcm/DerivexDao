// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// Importa o contrato Exchange que será utilizado para as trocas
import "./Exchange.sol";

contract DerivexFactory {
    // Mapeia o endereço de um token para o endereço da respectiva exchange
    mapping(address => address) public tokenToExchange;
    // Mapeia o endereço de uma exchange para o token correspondente
    mapping(address => address) public exchangeToToken;
    // Mapeia um ID único para um token específico
    mapping(uint256 => address) public idToToken;

    // Armazena todas as exchanges criadas
    Exchange[] public exchangeArray;

    // Evento que será emitido sempre que uma nova exchange for criada
    event ExchangeCreated(address indexed tokenAddress, address indexed exchangeAddress);

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
    }
}
