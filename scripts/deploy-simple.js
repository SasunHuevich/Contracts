const { ethers } = require("hardhat");

async function main() {
  console.log("Деплой тестового ERC20 токена...");
  
  // Получаем доступ к фабрике контрактов
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  
  // Деплоим контракт с простыми параметрами
  const token = await MockERC20.deploy(
    "Test Token",            // Имя
    "TEST",                  // Символ
    ethers.utils.parseEther("1000000")  // Начальное количество (1 миллион)
  );
  
  await token.deployed();
  
  console.log("=====================================");
  console.log("Тестовый ERC20 токен успешно развернут!");
  console.log("=====================================");
  console.log("Адрес токена:", token.address);
  console.log("Имя:", await token.name());
  console.log("Символ:", await token.symbol());
  console.log("Decimals:", await token.decimals());
  console.log("Общее количество:", ethers.utils.formatEther(await token.totalSupply()));
  console.log("=====================================");
  
  // Получаем список всех доступных аккаунтов
  const accounts = await ethers.getSigners();
  
  console.log("Перевод токенов на все доступные аккаунты...");
  
  // Перевод токенов на все аккаунты кроме первого (деплоера)
  for (let i = 1; i < Math.min(accounts.length, 5); i++) {
    const amount = ethers.utils.parseEther("10000");
    await token.transfer(accounts[i].address, amount);
    console.log(`${i}: Переведено ${ethers.utils.formatEther(amount)} TEST на ${accounts[i].address}`);
  }
  
  console.log("=====================================");
  console.log("ВАЖНО: Используйте этот адрес для инвестирования:");
  console.log(token.address);
  console.log("=====================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });