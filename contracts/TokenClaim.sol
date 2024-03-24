//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract ClaimDepositToken is Context, AccessControlEnumerable, Initializable {
    address public signerAddress;
    address public signerEth;
    address public depositAddress;

    struct Claim {
        bytes32 _hashedMessage;
        uint256 value;
        address toAddress;
    }

    mapping(uint256 => bool) public claimHistory;
    mapping(bytes32 => bool) public hashClaim;
    bool public paused;

    event ClaimToken(address _token, uint256 value, address to);
    event ClaimEth(uint256 value, address to);
    event DepositToken(address from, address _token, uint256 value);
    function initialize(
        address _signerToken,
        address _signerEth
    ) public initializer {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        signerAddress = _signerToken;
        signerEth = _signerEth;
        depositAddress = address(this);
    }

    function depositToken(address _token, uint256 _value) public {
        IERC20(_token).transferFrom(_msgSender(), depositAddress, _value);
        emit DepositToken(_msgSender(), _token, _value);
    }

    function claimToken(
        bytes memory signature,
        uint256 claimId,
        address _tokenAddress,
        uint256 _value,
        uint256 _expTime
    ) public {
        bytes32 msgHash = keccak256(
            abi.encodePacked(_msgSender(), claimId, _tokenAddress, _value, _expTime)
        );
        require(isValidSign(signature, msgHash, signerAddress), "Invalid sign");

        require(!hashClaim[msgHash], "Claimed token");
        require(!claimHistory[claimId], "Claimed token");
        require(block.timestamp < _expTime, "Expired Claim Time");
        require(
                _value <= IERC20(_tokenAddress).balanceOf(address(this)),
                "Not Enough Token"
            );
        require(!paused, "Claim Was Paused");
        claimHistory[claimId] = true;
        hashClaim[msgHash] = true;
        //Transfer
        IERC20(_tokenAddress).transfer(_msgSender(), _value);
        emit ClaimToken(_tokenAddress, _value, _msgSender());
    }

    function claimEth(
        bytes memory signature,
        uint256 _value,
        uint256 _expTime,
        uint256 claimId
    ) public {
        bytes32 msgHash = keccak256(
            abi.encodePacked(_msgSender(), _value, _expTime, claimId)
        );
        require(isValidSign(signature, msgHash, signerEth), "Invalid sign");

        require(!hashClaim[msgHash], "Claimed token");
        require(!claimHistory[claimId], "Claimed token");
        require(block.timestamp < _expTime, "Expired Claim Time");
        require(
            _value <= address(this).balance,
            "Not Enough ETH"
        );
        require(!paused, "Claim Was Paused");
        claimHistory[claimId] = true;
        hashClaim[msgHash] = true;
        //Transfer
        payable(_msgSender()).call{value: _value}("");
        emit ClaimEth(_value, _msgSender());
    }

    function getRemainBalance(address _token) public view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    function setPause(bool _bool) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "must have admin role"
        );
        paused = _bool;
    }

    function setDepositAddress(address _depositAddres) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "must have admin role"
        );
        depositAddress = _depositAddres;
    }

    function safuToken(address _token, uint256 _value) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "must have admin role"
        );
        IERC20 token = IERC20(_token);
        token.transfer(_msgSender(), _value);
    }

    function safuEth(address _to, uint256 _value) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "must have admin role"
        );
        payable(address(_to)).call{value: _value}("");
    }
    

    function setSigner(address _signerAddress, address _signerEth) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "must have admin role"
        );
        signerAddress = _signerAddress;
        signerEth = _signerEth;
    }

    function getClaimByClaimId(uint256 claimId) public view returns (bool) {
        return claimHistory[claimId];
    }

    function isValidSign(
        bytes memory signature,
        bytes32 hash,
        address signer
    ) public pure returns (bool) {
        // verify hash signed via `personal_sign`
        return ECDSA.recover(ECDSA.toEthSignedMessageHash(hash), signature) == signer;
    }

    receive() external payable {}

    fallback() external payable {}
}
