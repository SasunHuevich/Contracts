// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockUniswapRouter {
    uint256 public returnAmount;
    
    // Устанавливает сумму, которую вернет мок при свопе
    function setReturnAmount(uint256 amount) external {
        returnAmount = amount;
    }
    
    // Мок для функции exactInputSingle из Uniswap
    function exactInputSingle(
        ExactInputSingleParams calldata params
    ) external returns (uint256) {
        // Перевести токены на этот контракт
        IERC20(params.tokenIn).transferFrom(msg.sender, address(this), params.amountIn);
        
        // Перевести токены получателю
        IERC20(params.tokenOut).transfer(params.recipient, returnAmount);
        
        return returnAmount;
    }
    
    // Структура для совместимости с интерфейсом ISwapRouter
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
}