// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract BuyMusic is AccessControl {
    address public receiveAddress;
    IERC20 token;
    IERC721 nftAddress;

    event BuySong(address buyer, address seller, uint256 songId, uint256 price);

    constructor(address _token, address _nft) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        token = IERC20(_token);
        nftAddress = IERC721(_nft);
    }

    function buySong(
        uint256 price,
        address _seller,
        uint256 _songId
    ) public {
        require(nftAddress.ownerOf(_songId) == _seller, "you are not owner!");
        require(token.balanceOf(msg.sender) >= price, "you not enough balance");
        token.transferFrom(msg.sender, _seller, price);
        emit BuySong(msg.sender, _seller, _songId, price);
    }
}