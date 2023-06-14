import { ethers } from "./ethers-5.1.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("Fund");
const balanceButton = document.getElementById("getBalance");
const withdrwaButton = document.getElementById("getWithdraw");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrwaButton.onclick = pleaseWithdraw;

function connect() {
  ethereum
    .request({ method: "eth_requestAccounts" })
    .then(() => {
      connectButton.innerHTML = "Connected!";
    })
    .catch((error) => {
      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        console.log("Please connect to MetaMask.");
      } else {
        console.error(error);
      }
    });
}

async function getBalance() {
  if (typeof window.ethereum !== undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  if (typeof window.ethereum !== undefined) {
    console.log(`Funding with ${ethAmount} ETH`);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionResponse(transactionResponse, provider);
      console.log("Done!😄");
    } catch (e) {
      console.log(e);
    }
  }
}

async function pleaseWithdraw() {
  if (typeof window.ethereum !== undefined) {
    console.log(`Withdrawing...`);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.cheaperWithdraw();
      await listenForTransactionResponse(transactionResponse, provider);
      console.log("Done!");
    } catch (e) {
      console.log(e);
    }
  }
}

function listenForTransactionResponse(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    return setTimeout(() => {
      provider.once(transactionResponse.hash, () => {
        console.log(
          `Completed with ${transactionResponse.confirmations} confirmation`
        );
        resolve();
      });
    }, 5000);
  });
}
