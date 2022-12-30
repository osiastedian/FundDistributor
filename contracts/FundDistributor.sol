// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract FundDistributor {
    address payable public owner;

    event Withdrawal(uint256 amount, uint256 when);
    event TransferOwnership(address newOwner);
    event Distribute(address from, uint256 amount, address payable[] receivers);

    constructor() payable {
        owner = payable(msg.sender);
    }

    modifier isOwner() {
        require(msg.sender == owner, "You aren't the owner");
        _;
    }

    function transferOwnership(address payable newOwner) public isOwner {
        owner = newOwner;
        emit TransferOwnership(newOwner);
    }

    function withdraw() public isOwner {
        emit Withdrawal(address(this).balance, block.timestamp);
        owner.transfer(address(this).balance);
    }

    function distribute(
        address payable[] calldata receivers,
        uint256 amountPerReceiver
    ) public payable {
        require(receivers.length > 0, "No receivers");
        require(amountPerReceiver > 0, "Invalid amount per receiver");
        require(
            msg.value >= receivers.length * amountPerReceiver,
            "Insufficient amount"
        );

        for (uint256 i = 0; i < receivers.length; i++) {
            address payable receiver = receivers[i];
            receiver.transfer(amountPerReceiver);
        }

        emit Distribute(msg.sender, amountPerReceiver, receivers);
    }
}
