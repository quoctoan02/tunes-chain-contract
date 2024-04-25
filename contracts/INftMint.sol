// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface INftMint is IERC721{
    event Minted(address toAddress, uint256 Id);

    function mint(address toAddress) external ;
}