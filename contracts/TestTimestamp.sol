// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract TestTimestamp {
    function getBlockTime() view public returns(uint time) {
        return block.timestamp;
    }

}