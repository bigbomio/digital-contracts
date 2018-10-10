pragma solidity ^0.4.24;

import './BBFreelancer.sol';
import './BBLib.sol';

contract BBParams is BBFreelancer{

  mapping(address => bool) private admins;
  event AdminAdded(address indexed admin, bool add);
  modifier onlyAdmin() {
    require(admins[msg.sender]==true);
    _;
  }

  function addAdmin(address admin, bool add) onlyOwner public {
    require(admin!=address(0x0));
    admins[admin] = add;
    emit AdminAdded(admin, add);
  }

  function isAdmin(address admin) public view returns (bool isAdm){
    isAdm = admins[admin];
  }

  function setFreelancerParams(uint256 paymentLimitTimestamp, uint256 rejectedPaymentLimitTimestamp) onlyAdmin public {
  	require(paymentLimitTimestamp > 0);
    require(rejectedPaymentLimitTimestamp > 0);
    bbs.setUint(keccak256('PAYMENT_LIMIT_TIMESTAMP'), paymentLimitTimestamp);
    bbs.setUint(keccak256('REJECTED_PAYMENT_LIMIT_TIMESTAMP'), rejectedPaymentLimitTimestamp);
  
  }
  function getFreelancerParams() public view returns(uint256, uint256){
  	return (bbs.getUint(keccak256('PAYMENT_LIMIT_TIMESTAMP')), bbs.getUint(keccak256('REJECTED_PAYMENT_LIMIT_TIMESTAMP')));
  }
  function setPollType(uint256 pollType, address relatedAddr) onlyAdmin public{
    bbs.setAddress(BBLib.toB32('POLL_RELATED', pollType), relatedAddr);
  }
  function getPollType(uint256 pollType)  public view returns(address){
    return bbs.getAddress(BBLib.toB32('POLL_RELATED', pollType));
  }
  
  function setVotingParams(uint256 pollType, uint256 minVotes, uint256 maxVotes, 
   uint256 stakeDeposit, uint256 addOptionDuration, uint256 commitDuration, 
   uint256 revealDuration, uint256 bboRewards) onlyAdmin public {

  	require(minVotes > 0);
  	require(maxVotes>0);
    require(maxVotes > minVotes);
  	require(stakeDeposit>0);
  	require(commitDuration>0);
  	require(revealDuration>0);
  	require(bboRewards>0);

    bbs.setUint(BBLib.toB32(pollType, 'MIN_VOTES'), minVotes);
    bbs.setUint(BBLib.toB32(pollType, 'MAX_VOTES'), maxVotes);
    bbs.setUint(BBLib.toB32(pollType, 'STAKED_DEPOSIT'), stakeDeposit);
    bbs.setUint(BBLib.toB32(pollType, 'ADDOPTION_DURATION'), addOptionDuration);
    bbs.setUint(BBLib.toB32(pollType, 'COMMIT_DURATION'), commitDuration);
    bbs.setUint(BBLib.toB32(pollType, 'REVEAL_DURATION'), revealDuration);
    bbs.setUint(BBLib.toB32(pollType, 'BBO_REWARDS'), bboRewards);
  
  }
  // function getVotingParams(uint256 pollType) public view returns(uint256, uint256,uint256,uint256, uint256,uint256,uint256){
  // 	return (bbs.getUint(BBLib.toB32(pollType, 'MIN_VOTES')), bbs.getUint(BBLib.toB32(pollType, 'MAX_VOTES')),  
  // 	bbs.getUint(BBLib.toB32(pollType, 'STAKED_DEPOSIT')), bbs.getUint(BBLib.toB32(pollType, 'ADDOPTION_DURATION')), bbs.getUint(BBLib.toB32(pollType, 'COMMIT_DURATION')), 
  // 	bbs.getUint(BBLib.toB32(pollType, 'REVEAL_DURATION')), bbs.getUint(BBLib.toB32(pollType, 'BBO_REWARDS')));
  // }

}