// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Nft is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter currentTokenId;

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {
        currentTokenId.increment();
    }

    function mint(uint256 quantity) external {
        require(quantity > 0, "quantity must be greater than zero");
        for (uint8 i = 0; i < quantity; i++) {
            _mint(msg.sender, currentTokenId.current());
            currentTokenId.increment();
        }
    }
    function burn(uint256 tokenId) public virtual returns(bool) {
        _burn(tokenId);
        return(true);
    }
}