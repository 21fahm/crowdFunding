const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  let { deployer } = await getNamedAccounts();
  let fundMe = await ethers.getContract("FundMe", deployer);

  console.log("Funding contract...");

  let funded = await fundMe.fund({ value: ethers.utils.parseEther("1") });
  await funded.wait(1);
  console.log("Contract funded!!!😃");
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
