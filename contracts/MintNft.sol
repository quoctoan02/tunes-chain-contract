//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./INftMint.sol";


contract MintNft is Context, AccessControlEnumerable {

    INftMint public nft;
    IERC20 public token;

    using SafeMath for uint256;

    uint256 public price;
    uint256 public totalAmountNft;

    uint256 public startTime;
    uint256 public endTime;


    address public receiveAddress;

    bool public allowMint;

    mapping(address => uint) public mintHistory;

    event MintNftEvent(address toAddress);

    modifier onlyAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "must have admin role"
        );
        _;
    }

    constructor(address _nftAddress, uint256 _price, address _tokenpayment, uint256 _totalAmountNft, uint256 _startTime, uint256 _endTime) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

        nft = INftMint(_nftAddress);
        token = IERC20(_tokenpayment);
        totalAmountNft = _totalAmountNft;
        receiveAddress = _msgSender();
        price = _price;
        startTime = _startTime;
        endTime = _endTime;
        allowMint = true;
    }

    function mintNft() external {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Time invalid!");
        require(_msgSender() != address(0), "could not mint to zero address");
        require(allowMint == true, "could not mint");
        require(mintHistory[_msgSender()] < 10, "only 10 NFT per wallet");
        require(token.balanceOf(_msgSender()) >= price, "not enough balance");
        require(totalAmountNft > 0, "not enough amount nft");

        nft.mint(_msgSender());
        token.transferFrom(_msgSender(), receiveAddress, price);
        mintHistory[_msgSender()] += 1;

        totalAmountNft -= 1;

        emit MintNftEvent(_msgSender());
    }

    function setNftAddress(address _nftAddress) public onlyAdmin {
        nft = INftMint(_nftAddress);
    }

    function setReceiveAddress(address _receiveAddress) public onlyAdmin {
        receiveAddress = _receiveAddress;
    }

    function setPrice(uint256 _price) public onlyAdmin {
        price = _price;
    }

    function setAllowMint(bool _status) public onlyAdmin {
        allowMint = _status;
    }

    function setStartTime(uint256 _startTime) public onlyAdmin {
        startTime = _startTime;
    }

    function setEndTime(uint256 _endTime) public onlyAdmin {
        endTime = _endTime;
    }

    function setTotalAmountNft(uint256 _totalAmountNft) public onlyAdmin {
        totalAmountNft = _totalAmountNft;
    }

    function withdrawToken(uint256 _value) public onlyAdmin {
        token.transfer(_msgSender(), _value);
    }

    function getBalanceTokenPayment() public view returns (uint256) {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "must have admin role"
        );
        return token.balanceOf(address(this));
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}