const ExchangeDAO = artifacts.require("ExchangeDAO");

contract("ExchangeDAO", (accounts) => {
  it("deve definir e retornar a taxa de câmbio", async () => {
    const instance = await ExchangeDAO.deployed();
    
    // Definindo a taxa de câmbio
    await instance.setRate(500);
    
    // Verificando se o valor foi corretamente armazenado
    const rate = await instance.getRate();
    assert.equal(rate, 500, "A taxa de câmbio deveria ser 500");
  });
});
