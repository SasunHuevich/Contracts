const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SocialTrading", function () {
  let socialTrading;
  let mockToken;
  let mockTokenOut;
  let owner;
  let manager;
  let investor;
  let mockUniswapRouter;

  beforeEach(async function () {
    // Деплой мок-контрактов
    const MockToken = await ethers.getContractFactory("MockERC20");
    const MockUniswapRouter = await ethers.getContractFactory("MockUniswapRouter");
    
    [owner, manager, investor] = await ethers.getSigners();
    
    // Деплой мок-токенов
    mockToken = await MockToken.deploy("Mock Token", "MOCK", ethers.utils.parseEther("1000000"));
    mockTokenOut = await MockToken.deploy("Mock Token Out", "MOUT", ethers.utils.parseEther("1000000"));
    
    // Деплой мок-роутера Uniswap
    mockUniswapRouter = await MockUniswapRouter.deploy();
    
    // Деплой контракта
    const SocialTrading = await ethers.getContractFactory("SocialTrading");
    socialTrading = await SocialTrading.deploy(mockUniswapRouter.address);
    
    // Передача токенов инвестору
    await mockToken.transfer(investor.address, ethers.utils.parseEther("10000"));
    await mockTokenOut.transfer(mockUniswapRouter.address, ethers.utils.parseEther("10000"));
  });

  describe("Инвестирование токенов", function () {
    it("Должен позволять инвестору передавать токены менеджеру", async function () {
      const amount = ethers.utils.parseEther("1000");
      
      // Апрув токенов для контракта
      await mockToken.connect(investor).approve(socialTrading.address, amount);
      
      // Инвестирование токенов
      await socialTrading.connect(investor).investTokens(manager.address, mockToken.address, amount);
      
      // Проверка, что токены переведены на контракт
      expect(await mockToken.balanceOf(socialTrading.address)).to.equal(amount);
      
      // Проверка, что инвестиция записана в контракте
      const investmentAmount = await socialTrading.getInvestmentAmount(manager.address, investor.address, mockToken.address);
      expect(investmentAmount).to.equal(amount);
      
      // Проверка, что токен добавлен в список токенов инвестора
      const tokens = await socialTrading.getInvestorTokens(manager.address, investor.address);
      expect(tokens).to.include(mockToken.address);
    });
  });
  
  describe("Торговля на Uniswap", function () {
    it("Должен позволять менеджеру торговать токенами инвестора", async function () {
      const investAmount = ethers.utils.parseEther("1000");
      const tradeAmount = ethers.utils.parseEther("500");
      const expectedOutAmount = ethers.utils.parseEther("400"); // Мок-значение свопа
      
      // Настройка мок-возврата для свопа
      await mockUniswapRouter.setReturnAmount(expectedOutAmount);
      
      // Инвестирование токенов
      await mockToken.connect(investor).approve(socialTrading.address, investAmount);
      await socialTrading.connect(investor).investTokens(manager.address, mockToken.address, investAmount);
      
      // Менеджер торгует токенами
      await socialTrading.connect(manager).tradeOnUniswap(
        investor.address,
        mockToken.address,
        mockTokenOut.address,
        tradeAmount,
        0 // minAmountOut
      );
      
      // Проверка, что баланс первого токена уменьшился
      const tokenInBalance = await socialTrading.getInvestmentAmount(manager.address, investor.address, mockToken.address);
      expect(tokenInBalance).to.equal(investAmount.sub(tradeAmount));
      
      // Проверка, что второй токен добавлен и его баланс увеличился
      const tokenOutBalance = await socialTrading.getInvestmentAmount(manager.address, investor.address, mockTokenOut.address);
      expect(tokenOutBalance).to.equal(expectedOutAmount);
      
      // Проверка, что оба токена в списке инвестора
      const tokens = await socialTrading.getInvestorTokens(manager.address, investor.address);
      expect(tokens).to.include.members([mockToken.address, mockTokenOut.address]);
    });
    
    it("Не должен позволять менеджеру торговать токенами, которых нет у инвестора", async function () {
      // Попытка торговать без инвестиций
      await expect(
        socialTrading.connect(manager).tradeOnUniswap(
          investor.address,
          mockToken.address,
          mockTokenOut.address,
          ethers.utils.parseEther("100"),
          0
        )
      ).to.be.revertedWith("No investment found");
    });
  });
  
  describe("Вывод токенов", function () {
    it("Должен позволять инвестору выводить свои токены", async function () {
      const amount = ethers.utils.parseEther("1000");
      const withdrawAmount = ethers.utils.parseEther("500");
      
      // Инвестирование токенов
      await mockToken.connect(investor).approve(socialTrading.address, amount);
      await socialTrading.connect(investor).investTokens(manager.address, mockToken.address, amount);
      
      // Запоминаем начальный баланс инвестора
      const initialBalance = await mockToken.balanceOf(investor.address);
      
      // Вывод токенов
      await socialTrading.connect(investor).withdrawTokens(manager.address, mockToken.address, withdrawAmount);
      
      // Проверка, что токены вернулись к инвестору
      const finalBalance = await mockToken.balanceOf(investor.address);
      expect(finalBalance.sub(initialBalance)).to.equal(withdrawAmount);
      
      // Проверка, что баланс в контракте уменьшился
      const remainingInvestment = await socialTrading.getInvestmentAmount(manager.address, investor.address, mockToken.address);
      expect(remainingInvestment).to.equal(amount.sub(withdrawAmount));
    });
  });
});