const MyToken = artifacts.require("MyToken");

contract("MyToken", accounts => {
    it("should mint tokens to the creator", async () => {
        const myToken = await MyToken.new("My Token", "MTK");
        const balance = await myToken.balanceOf(accounts[0]);
        assert.equal(balance.toString(), (1000 * 10 ** 18).toString(), "Initial balance is not correct");
    });
});