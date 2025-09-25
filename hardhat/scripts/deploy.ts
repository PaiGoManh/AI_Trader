import { ethers } from "hardhat";  // works with @nomicfoundation/hardhat-ethers

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  // Get balance correctly in ethers v6
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "BNB");

  // Deploy your contract
  const TradingPlatform = await ethers.getContractFactory("AITradingPlatform");
  const tradingPlatform = await TradingPlatform.deploy();

  await tradingPlatform.waitForDeployment();

  console.log("AITradingPlatform deployed to:", await tradingPlatform.getAddress());
  console.log(
    `BscScan link: https://testnet.bscscan.com/address/${await tradingPlatform.getAddress()}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
