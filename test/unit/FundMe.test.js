const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { mockOnThisNetworks } = require("../../account-hardhat-config");

mockOnThisNetworks.includes(network.name)
  ? describe("FundMe", () => {
      let contract, deployer, mockV3Aggregator;
      let sentValue = ethers.utils.parseEther("1");
      beforeEach(async () => {
        // const {deployer} = await ethers.getSigners();
        // const signer = deployer[0];
        deployer = (await getNamedAccounts()).deployer; //Account connected to fund me
        await deployments.fixture(["all"]);
        contract = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator");
      });

      describe("constructor", () => {
        it("Should return the correct aggregator address", async () => {
          const response = await contract.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", () => {
        it("Should fail if not enough ETH sent", async () => {
          expect(async () => {
            await contract.fund();
          }).to.be.revertedWith("FundMe__Unauthorized");
        });

        it("Should update the amount sent", async () => {
          await contract.fund({ value: sentValue });
          const amount = await contract.getAmountFunded(deployer);
          assert.equal(amount.toString(), sentValue.toString());
        });

        it("Should get the s_funders", async () => {
          await contract.fund({ value: sentValue });
          const response = await contract.getFunders(0);
          assert.equal(response, deployer);
        });
      });

      describe("cheaperWithdraw", () => {
        //Should call the contract so that it can be funded
        beforeEach(async () => {
          await contract.fund({ value: sentValue });
        });
        it("Withdraw from a single founder", async () => {
          //Should check that balances change
          const amountInContract = await contract.provider.getBalance(
            contract.address
          );
          const amountInWallet = await contract.provider.getBalance(deployer);

          //act- Now we call the withdraw balance
          const withdraw = await contract.cheaperWithdraw();
          const transactionReceipt = await withdraw.wait(1);

          const { gasUsed, effectiveGasPrice } = transactionReceipt;

          const gasCost = gasUsed.mul(effectiveGasPrice);
          const amountAfterWithdrawC = await contract.provider.getBalance(
            contract.address
          );
          const amountAfterWithdrawE = await contract.provider.getBalance(
            deployer
          );

          assert.equal(amountAfterWithdrawC, 0);
          assert.equal(
            amountInContract.add(amountInWallet).toString(),
            amountAfterWithdrawE.add(gasCost).toString()
          );
        });
        it("Allows us to withdraw from multiple users", async () => {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeContracts = await contract.connect(accounts[i]);
            await fundMeContracts.fund({ value: sentValue });
          }

          const amountInContract = await contract.provider.getBalance(
            contract.address
          );
          const amountInWallet = await contract.provider.getBalance(deployer);

          const withdraw = await contract.cheaperWithdraw();
          const transactionReceipt = await withdraw.wait(1);

          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const amountAfterWithdrawC = await contract.provider.getBalance(
            contract.address
          );
          const amountAfterWithdrawE = await contract.provider.getBalance(
            deployer
          );

          assert.equal(amountAfterWithdrawC, 0);
          assert.equal(
            amountInContract.add(amountInWallet).toString(),
            amountAfterWithdrawE.add(gasCost).toString()
          );

          for (let i = 1; i < 6; i++) {
            assert.equal(
              await contract.getAmountFunded(accounts[i].address),
              0
            );
          }
          expect(async () => {
            await contract.getFunders(0);
          }).to.be.revertedWith("FundMe__Unauthorized");
        });
        it("only allows owners to withdraw", async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const connectAttacker = await contract.connect(attacker);

          expect(async () => {
            await connectAttacker.cheaperWithdraw();
          }).to.be.revertedWith("FundMe__Unauthorized");
        });
      });
    })
  : describe.skip;
