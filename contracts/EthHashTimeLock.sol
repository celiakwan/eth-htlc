// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract EthHashTimeLock {
    using SafeMath for uint256;

    address payable sender;
    address payable recipient;
    uint256 amount;
    bytes32 hashlock;
    uint256 timelock;
    Status status;

    enum Status {
        INITIATED,
        WITHDRAWN,
        REFUNDED
    }

    event Initiation(address indexed sender, address indexed recipient, uint256 amount, bytes32 hashlock, uint256 timelock);

    event Withdrawal(address indexed sender, address indexed recipient, uint256 amount, bytes32 preimage);

    event Refund(address indexed sender, uint256 amount);

    modifier initiable(uint256 _timelock) {
        require(msg.value > 0);
        require(now < _timelock);
        _;
    }

    modifier withdrawable() {
        require(msg.sender == recipient);
        require(now <= timelock);
        _;
    }

    modifier refundable() {
        require(msg.sender == sender);
        require(now > timelock);
        _;
    }

    modifier statusRemainsInitiated() {
        require(status == Status.INITIATED);
        _;
    }

    modifier hashlockMatches(bytes32 _preimage) {
        require(sha256(abi.encodePacked(_preimage)) == hashlock);
        _;
    }

    function initiate(address payable _recipient, bytes32 _hashlock, uint256 _timelock)
    external payable initiable(_timelock) {
        sender = msg.sender;
        recipient = _recipient;
        amount = msg.value;
        hashlock = _hashlock;
        timelock = _timelock;
        status = Status.INITIATED;

        emit Initiation(sender, recipient, amount, hashlock, timelock);
    }

    function withdraw(bytes32 _preimage) external withdrawable statusRemainsInitiated hashlockMatches(_preimage) {
        recipient.transfer(amount);
        
        status = Status.WITHDRAWN;

        emit Withdrawal(sender, recipient, amount, _preimage);
    }

    function refund(bytes32 _preimage) external refundable statusRemainsInitiated hashlockMatches(_preimage) {
        sender.transfer(amount);

        status = Status.REFUNDED;

        emit Refund(sender, amount);
    }
}