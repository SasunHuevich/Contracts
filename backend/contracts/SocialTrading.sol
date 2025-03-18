// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IUniswapV3Router {
    function exactInputSingle(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        address recipient,
        uint256 deadline,
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint160 sqrtPriceLimitX96
    ) external returns (uint256 amountOut);
}

contract SocialTrading {
    address public manager;
    IUniswapV3Router public uniswapRouter;
    mapping(address => uint256) public userBalances;

    event TokensDeposited(address indexed user, uint256 amount);
    event TokensTraded(address indexed user, uint256 amountIn, uint256 amountOut);

    modifier onlyManager() {
        require(msg.sender == manager, "Только менеджер может выполнять это действие");
        _;
    }

    constructor(address _uniswapRouter) {
        manager = msg.sender;
        uniswapRouter = IUniswapV3Router(_uniswapRouter);
    }

    function depositTokens(address token, uint256 amount) external {
        require(amount > 0, "Сумма должна быть больше 0");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        userBalances[msg.sender] += amount;
        emit TokensDeposited(msg.sender, amount);
    }

    function tradeOnUniswap(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint256 minAmountOut
    ) external onlyManager {
        require(IERC20(tokenIn).balanceOf(address(this)) >= amountIn, "Недостаточно токенов");

        IERC20(tokenIn).approve(address(uniswapRouter), amountIn);

        uint256 amountOut = uniswapRouter.exactInputSingle(
            tokenIn,
            tokenOut,
            fee,
            address(this),
            block.timestamp + 300,
            amountIn,
            minAmountOut,
            0
        );

        emit TokensTraded(msg.sender, amountIn, amountOut);
    }
}
