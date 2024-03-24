// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IUniswapV2Router02.sol";
import "./IUniswapV2Factory.sol";
import "./IUniswapV2Pair.sol";

contract TOKEN is Ownable, ERC20 {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    uint256 public initToken = 1_000_000_000 * 10 ** 18;

    IUniswapV2Router02 public uniswapV2Router;
    IUniswapV2Factory public factory;
    EnumerableSet.AddressSet private _listPairs;
    address public marketingAddress;

    uint256 public buyFee = 3;
    uint256 public sellFee = 3;
    bool inSwap = false;

    mapping(address => bool) public isExcludedFromFee;
    uint256 public antiBotAmount = 10_000_000 * 10 ** 18;
    uint256 public numTokensAutoswap = 8000 * 10 ** 18;
    uint256 public maxTokensAutoswap = 2000_000 * 10 ** 18;

    uint256 public antiBotInterval = 30;
    uint256 public antiBotEndTime;
    bool public tradingEnabled;
    bool private swapAndLiquifyEnabled = true;

    constructor() ERC20("TEST", "TEST") {
        _mint(_msgSender(), initToken);
        IUniswapV2Router02 _uniswapV2Router = IUniswapV2Router02(0x327Df1E6de05895d2ab08513aaDD9313Fe505d86);
        uniswapV2Router = _uniswapV2Router;
        factory = IUniswapV2Factory(_uniswapV2Router.factory());
        marketingAddress = address(0xF8b446c2Bd2169BE53d12582aeC975Bc0b3F3652);
        isExcludedFromFee[_msgSender()] = true;
        isExcludedFromFee[marketingAddress] = true;
        tradingEnabled = false;
        address pair = factory.createPair(uniswapV2Router.WETH(), address(this));
        _listPairs.add(pair);
    }

    modifier lockTheSwap() {
        inSwap = true;
        _;
        inSwap = false;
    }

    function burn(uint256 amount) public {
        _burn(_msgSender(), amount);
    }

    function enableTrading() external onlyOwner {
        require(!tradingEnabled, "Trading already enabled.");
        tradingEnabled = true;
        antiBotEndTime = block.timestamp + antiBotInterval;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual override {

        uint256 taxFee;
        require(tradingEnabled || isExcludedFromFee[sender] || isExcludedFromFee[recipient], "Trading not yet enabled!");
        if (inSwap) {
            super._transfer(sender, recipient, amount);
            return;
        }
        //Cal Fee
        if (!isExcludedFromFee[sender] && isPair(recipient)) {
            taxFee = sellFee;
        } else if (!isExcludedFromFee[recipient] && isPair(sender)) {
            taxFee = buyFee;
        }

        if (
            antiBotEndTime > block.timestamp &&
            amount > antiBotAmount &&
            sender != address(this) &&
            recipient != address(this) &&
            isPair(sender)
        ) {
            taxFee = 85;
        }

        if (taxFee > 0 && sender != address(this) && recipient != address(this)) {
            uint256 _fee = amount.mul(taxFee).div(100);
            super._transfer(sender, address(this), _fee);
            amount = amount.sub(_fee);
        } else {
            if (balanceOf(address(this)) > numTokensAutoswap && swapAndLiquifyEnabled) {
                swapAndLiquify();
            }
        }

        super._transfer(sender, recipient, amount);
    }

    function swapAndLiquify() internal lockTheSwap {
        uint256 numTokenToSell = balanceOf(address(this)) > maxTokensAutoswap ? maxTokensAutoswap : balanceOf(address(this));
        swapTokensForETH(numTokenToSell);
    }

    function swapTokensForETH(uint256 tokenAmount) private {
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = uniswapV2Router.WETH();

        _approve(address(this), address(uniswapV2Router), tokenAmount);

        uniswapV2Router.swapExactTokensForETH(tokenAmount, 0, path, marketingAddress, block.timestamp);
    }

    function setExcludeFromFee(address _address, bool _status) external onlyOwner {
        require(_address != address(0), "0x is not accepted here");
        require(isExcludedFromFee[_address] != _status, "Status was set");
        isExcludedFromFee[_address] = _status;
    }

    function changeMarketingAddress(address _marketingAddress) external {
        require(_msgSender() == marketingAddress, "Only Marketing Wallet!");
        require(_marketingAddress != address(0), "0x is not accepted here");

        marketingAddress = _marketingAddress;
    }


    function changeNumTokensSellToAddToETH(uint256 _numTokensSellToAddToETH) external onlyOwner {
        require(_numTokensSellToAddToETH != 0, "_numTokensSellToAddToETH !=0");
        numTokensAutoswap = _numTokensSellToAddToETH;
    }

    function isPair(address account) public view returns (bool) {
        return _listPairs.contains(account);
    }

    function addPair(address pair) public onlyOwner returns (bool) {
        require(pair != address(0), "TOKEN: pair is the zero address");
        return _listPairs.add(pair);
    }

    function delPair(address pair) public onlyOwner returns (bool) {
        require(pair != address(0), "TOKEN: pair is the zero address");
        return _listPairs.remove(pair);
    }

    function getMinterLength() public view returns (uint256) {
        return _listPairs.length();
    }

    function getPair(uint256 index) public view returns (address) {
        require(index <= _listPairs.length() - 1, "TOKEN: index out of bounds");
        return _listPairs.at(index);
    }

    function setSwapAndLiquifyEnabled(bool _enabled) public onlyOwner {
        swapAndLiquifyEnabled = _enabled;
    }

    // receive eth
    receive() external payable {}

}
