const { ethers, getNamedAccounts, network } = require("hardhat");
const { mockOnThisNetworks } = require("../../account-hardhat-config");
const { assert } = require("chai");

mockOnThisNetworks.includes(network.name)
  ? describe.skip
  : describe("FundMe", () => {
      let fundMe, deployer;
      const sendValue = ethers.utils.parseEther("1");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });
      it("should allow people to fund and withdraw", async () => {
        await fundMe.fund({ value: sendValue });
        await fundMe.cheaperWithdraw();
        const amountInContract = await fundMe.provider.getBalance(
          fundMe.address
        );
        assert(amountInContract.toString(), "0");
      });
    });
