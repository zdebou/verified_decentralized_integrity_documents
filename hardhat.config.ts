import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
};

// task action function receives the Hardhat Runtime Environment as second argument
task(
  "info",
  "Prints the current block numbe and other info",
  async (_, { ethers }) => {
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("Current block number: " + blockNumber, "; \n\n");
    console.log("Current signers:\n", (await ethers.getSigners()).map(_ => _.address).join(", "), "\n\n");
    console.log("Current provider:\n", ethers.provider, "\n\n");
    console.log(_);
    console.log((await ethers.getSigners()).map(_ => _.toJSON()));
  }
);

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs, hre) => {
    const balance = await hre.ethers.provider.getBalance(taskArgs.account);

    console.log(hre.ethers.formatEther(balance), "ETH");
  });

export default config;
