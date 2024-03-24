// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MarketPlace is AccessControlEnumerable, Initializable {
    address public receiveAddrress;
    IERC20 token;

    event BuySong(address from, uint256 buySongId, uint256 price);

    function initialize(
        IERC20 _token
    ) public initializer {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        receiveAddrress = _msgSender();
        token = IERC20(_token);
    }

    function buySong(uint256 price, uint256 buySongId) public {
        token.transferFrom(_msgSender(), receiveAddrress, price);
        emit BuySong(_msgSender(), buySongId, price);
    }

    function setReceiveAddress(address _receiveAddrress) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "must have admin role"
        );
        receiveAddrress = _receiveAddrress;
    }
}