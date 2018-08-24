pragma solidity ^0.4.24;

import './BBStorage.sol';

contract BBParams is BBFreelancer{

  function setParams(uint256 paymentLimitTimestamp, uint256 voterStackTokens) public onlyOwner {
  	require(paymentLimitTimestamp > 0);
  	require (voterStackTokens>0);
    bbs.setUint(keccak256(PAYMENT_LIMIT_TIMESTAMP), paymentLimitTimestamp);
    bbs.setUint(keccak256(FREELANCER_VOTING_STACK_TOKENS), voterStackTokens);
  
  }
  function getParams() public view returns(uint256, uint256){
  	return (bbs.getUint(keccak256(PAYMENT_LIMIT_TIMESTAMP)), bbs.getUint(keccak256(FREELANCER_VOTING_STACK_TOKENS)))
  }
}