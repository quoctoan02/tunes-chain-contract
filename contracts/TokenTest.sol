// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenTest is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) public {
        _mint(_msgSender(), 10**9 * 10**18);
    }
}