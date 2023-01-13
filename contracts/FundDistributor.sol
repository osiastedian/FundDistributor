// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FundDistributor {
    address payable public owner;

    event Withdrawal(uint256 amount, uint256 when);
    event WithdrawalTokens(uint256 amount, address token, uint256 when);
    event TransferOwnership(address newOwner);
    event Distribute(
        address indexed from,
        uint256 amount,
        address payable[] receivers
    );
    event DistributeTokens(
        address indexed from,
        address indexed tokenAddress,
        uint256 amount,
        address payable[] receivers
    );

    event Received(address, uint256);
    event Fallbacked(address, uint256);

    constructor() payable {
        owner = payable(msg.sender);
    }

    modifier isOwner() {
        require(msg.sender == owner, "You aren't the owner");
        _;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    fallback() external payable {
        emit Fallbacked(msg.sender, msg.value);
    }

    function transferOwnership(address payable newOwner) public isOwner {
        owner = newOwner;
        emit TransferOwnership(newOwner);
    }

    function withdraw() public payable isOwner {
        (bool sent, ) = owner.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
        emit Withdrawal(address(this).balance, block.timestamp);
    }

    function withdrawTokens(address tokenAddress) public isOwner {
        IERC20 token = IERC20(tokenAddress);
        uint256 amount = token.balanceOf(address(this));
        token.transfer(msg.sender, amount);
        emit WithdrawalTokens(amount, tokenAddress, block.timestamp);
    }

    function distribute(
        uint256 amountPerReceiver,
        address payable[] calldata receivers
    ) public payable {
        require(receivers.length > 0, "No receivers");
        require(amountPerReceiver > 0, "Invalid amount per receiver");
        require(
            msg.value >= receivers.length * amountPerReceiver,
            "Insufficient amount"
        );

        for (uint256 i = 0; i < receivers.length; i++) {
            address payable receiver = receivers[i];
            (bool sent, ) = receiver.call{value: amountPerReceiver}("");
            require(sent, "Failed to send Ether");
        }

        emit Distribute(msg.sender, amountPerReceiver, receivers);
    }

    function distributeTokens(
        uint256 amountPerReceiver,
        address tokenAddress,
        address payable[] calldata receivers
    ) public {
        require(receivers.length > 0, "No receivers");
        require(amountPerReceiver > 0, "Invalid amount per receiver");
        uint256 totalValue = receivers.length * amountPerReceiver;
        IERC20 token = IERC20(tokenAddress);
        require(
            token.balanceOf(msg.sender) >= totalValue,
            "Insufficient amount"
        );

        for (uint256 i = 0; i < receivers.length; i++) {
            address receiver = receivers[i];
            token.transferFrom(msg.sender, receiver, amountPerReceiver);
        }

        emit DistributeTokens(
            msg.sender,
            tokenAddress,
            amountPerReceiver,
            receivers
        );
    }
}
