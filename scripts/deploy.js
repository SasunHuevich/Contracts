const { ethers } = require("hardhat");

async function main() {
  // Адрес Uniswap V3 SwapRouter в основной сети
  const UNISWAP_ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  
  // Получаем контракт
  const SocialTrading = await ethers.getContractFactory("SocialTrading");
  
  // Деплой контракта с адресом роутера Uniswap
  const socialTrading = await SocialTrading.deploy(UNISWAP_ROUTER_ADDRESS);
  
  // Ждем завершения деплоя
  await socialTrading.deployed();
  
  console.log("SocialTrading deployed to:", socialTrading.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });