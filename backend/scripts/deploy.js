const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Деплоим контракт с аккаунта:", deployer.address);

    const uniswapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Адрес Uniswap V3 Router

    const SocialTrading = await hre.ethers.getContractFactory("SocialTrading");
    const socialTrading = await SocialTrading.deploy(uniswapRouter);

    await socialTrading.deployed();
    console.log("Контракт деплоен по адресу:", socialTrading.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
