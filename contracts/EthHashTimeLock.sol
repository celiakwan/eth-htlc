// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract EthHashTimeLock {
    address payable sender;
    address payable recipient;
    uint amount;
    bytes32 hashlock;
    uint timelock;
    Status status;

    enum Status {
        Initiated,
        Withdrawn,
        Refunded
    }

    event Initiation(address indexed sender, address indexed recipient, uint amount, bytes32 hashlock, uint timelock);

    event Withdrawal(address indexed sender, address indexed recipient, uint amount, bytes32 preimage);

    event Refund(address indexed sender, uint amount);

    modifier initiable(uint _timelock) {
        require(msg.value > 0);
        require(block.timestamp < _timelock);
        _;
    }

    modifier withdrawable() {
        require(msg.sender == recipient);
        require(block.timestamp <= timelock);
        _;
    }

    modifier refundable() {
        require(msg.sender == sender);
        require(block.timestamp > timelock);
        _;
    }

    modifier statusRemainsInitiated() {
        require(status == Status.Initiated);
        _;
    }

    modifier validHashlock(bytes32 _preimage) {
        require(sha256(abi.encodePacked(_preimage)) == hashlock);
        _;
    }

    function initiate(address payable _recipient, bytes32 _hashlock, uint _timelock) external payable initiable(_timelock) {
        sender = payable(msg.sender);
        recipient = _recipient;
        amount = msg.value;
        hashlock = _hashlock;
        timelock = _timelock;
        status = Status.Initiated;

        emit Initiation(sender, recipient, amount, hashlock, timelock);
    }

    function withdraw(bytes32 _preimage) external withdrawable statusRemainsInitiated validHashlock(_preimage) {
        status = Status.Withdrawn;
        recipient.transfer(amount);
        
        emit Withdrawal(sender, recipient, amount, _preimage);
    }

    function refund(bytes32 _preimage) external refundable statusRemainsInitiated validHashlock(_preimage) {
        status = Status.Refunded;
        sender.transfer(amount);
        
        emit Refund(sender, amount);
    }
}