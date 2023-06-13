const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  let { deployer } = await getNamedAccounts();
  let fundMe = await ethers.getContract("FundMe", deployer);

  console.log("Withdrawing from contract...");

  let funded = await fundMe.cheaperWithdraw();
  await funded.wait(1);
  console.log("Contract zero!!!☹️");
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
