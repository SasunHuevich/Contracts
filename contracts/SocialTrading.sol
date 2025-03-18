// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract SocialTrading is Ownable, ReentrancyGuard {
    // Хранит информацию о токенах каждого пользователя у менеджера
    struct Investment {
        uint256 amount;
        bool exists;
    }

    // Маппинг менеджеров и их инвесторов: manager => investor => token => amount
    mapping(address => mapping(address => mapping(address => Investment))) public investments;
    
    // Список токенов, которыми может торговать менеджер для каждого инвестора
    mapping(address => mapping(address => address[])) public investorTokens;
    
    // Адрес роутера Uniswap
    address public immutable uniswapRouter;
    
    // События
    event TokensInvested(address indexed investor, address indexed manager, address indexed token, uint256 amount);
    event TokensTraded(address indexed manager, address indexed investor, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event TokensWithdrawn(address indexed investor, address indexed manager, address indexed token, uint256 amount);
    
    constructor(address _uniswapRouter) {
        // Инициализация с адресом роутера Uniswap
        uniswapRouter = _uniswapRouter;
    }
    
    // Пользователь инвестирует токены менеджеру
    function investTokens(address manager, address token, uint256 amount) external nonReentrant {
        require(manager != address(0), "Invalid manager address");
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");
        
        // Перевод токенов от пользователя в контракт
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        // Обновление инвестиции
        if (!investments[manager][msg.sender][token].exists) {
            investorTokens[manager][msg.sender].push(token);
            investments[manager][msg.sender][token].exists = true;
        }
        
        investments[manager][msg.sender][token].amount += amount;
        
        emit TokensInvested(msg.sender, manager, token, amount);
    }
    
    // Менеджер торгует токенами инвестора на Uniswap
    function tradeOnUniswap(
        address investor, 
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    ) external nonReentrant {
        require(investments[msg.sender][investor][tokenIn].exists, "No investment found");
        require(investments[msg.sender][investor][tokenIn].amount >= amountIn, "Insufficient tokens");
        
        // Обновление баланса токена инвестора
        investments[msg.sender][investor][tokenIn].amount -= amountIn;
        
        // Апрув для Uniswap
        IERC20(tokenIn).approve(uniswapRouter, amountIn);
        
        // Параметры для свопа на Uniswap
        ISwapRouter router = ISwapRouter(uniswapRouter);
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: 3000, // 0.3% fee tier
            recipient: address(this),
            deadline: block.timestamp + 15 minutes,
            amountIn: amountIn,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: 0
        });
        
        // Выполнение свопа
        uint256 amountOut = router.exactInputSingle(params);
        
        // Добавление полученного токена в список инвестиций если его там еще нет
        if (!investments[msg.sender][investor][tokenOut].exists) {
            investorTokens[msg.sender][investor].push(tokenOut);
            investments[msg.sender][investor][tokenOut].exists = true;
        }
        
        // Обновление баланса нового токена
        investments[msg.sender][investor][tokenOut].amount += amountOut;
        
        emit TokensTraded(msg.sender, investor, tokenIn, tokenOut, amountIn, amountOut);
    }
    
    // Инвестор может вывести свои токены
    function withdrawTokens(address manager, address token, uint256 amount) external nonReentrant {
        require(investments[manager][msg.sender][token].exists, "No investment found");
        require(investments[manager][msg.sender][token].amount >= amount, "Insufficient tokens");
        
        // Обновление баланса токена
        investments[manager][msg.sender][token].amount -= amount;
        
        // Возврат токенов инвестору
        IERC20(token).transfer(msg.sender, amount);
        
        emit TokensWithdrawn(msg.sender, manager, token, amount);
    }
    
    // Получение списка всех токенов инвестора у определенного менеджера
    function getInvestorTokens(address manager, address investor) external view returns (address[] memory) {
        return investorTokens[manager][investor];
    }
    
    // Получение баланса токена инвестора у определенного менеджера
    function getInvestmentAmount(address manager, address investor, address token) external view returns (uint256) {
        return investments[manager][investor][token].amount;
    }
}