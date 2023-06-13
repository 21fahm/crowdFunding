const networkConfig = {
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
  1: {
    name: "Ethereum",
    ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  },
  80001: {
    name: "Mumbai",
    ethUsdPriceFeed: " 0x0715A7794a1dc8e42615F059dD6e406A6594651A",
  },
  137: {
    name: "Polygon",
    ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
  },
};

const mockOnThisNetworks = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 180000000000;

module.exports = {
  networkConfig,
  mockOnThisNetworks,
  DECIMALS,
  INITIAL_ANSWER,
};
