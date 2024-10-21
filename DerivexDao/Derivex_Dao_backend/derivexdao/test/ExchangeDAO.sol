// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ExchangeDAO {
    uint public exchangeRate;

    function setRate(uint newRate) public {
        exchangeRate = newRate;
    }

    function getRate() public view returns (uint) {
        return exchangeRate;
    }
}
