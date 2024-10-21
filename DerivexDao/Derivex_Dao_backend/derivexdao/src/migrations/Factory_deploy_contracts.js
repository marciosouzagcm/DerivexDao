const DerivexDAO = artifacts.require("Derivex Dao");

module.exports = function(deployer) {
  deployer.deploy(ExchangeDAO);
};