const { network } = require("hardhat");
const {
  networkConfig,
  mockOnThisNetworks,
} = require("../account-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let address;
  if (mockOnThisNetworks.includes(network.name)) {
    let deployContract = await get("MockV3Aggregator");
    address = deployContract.address;
  } else {
    address = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [address],
    log: true,
    waitConfirmations: network.config.blockConfirmation || 1,
  });
  log("Deployed FUND_ME!!! Great😄");
  log("\n--------------------------");

  if (
    !mockOnThisNetworks.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, [address]);
  } else {
    console.log("No deployment needed. LocalNetwork detected.");
  }
};
module.exports.tags = ["all", "fundme"];
