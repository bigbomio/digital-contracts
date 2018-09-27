pragma solidity ^0.4.24;

import './BBFreelancer.sol';

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

  function setFreelancerParams(uint256 paymentLimitTimestamp) onlyAdmin public {
  	require(paymentLimitTimestamp > 0);
    bbs.setUint(keccak256('PAYMENT_LIMIT_TIMESTAMP'), paymentLimitTimestamp);
  
  }
  function getFreelancerParams() public view returns(uint256){
  	return (bbs.getUint(keccak256('PAYMENT_LIMIT_TIMESTAMP')));
  }

  function setVotingParams(uint256 minVotes, uint256 maxVotes, uint256 voteQuorum,
   uint256 stakeDeposit, uint256 evidenceDuration, uint256 commitDuration, 
   uint256 revealDuration, uint256 bboRewards) onlyAdmin public {

  	require(minVotes > 0);
  	require(maxVotes>0);
    require(maxVotes > minVotes);
  	require(voteQuorum>0);
  	require(stakeDeposit>0);
  	require(evidenceDuration>0);
  	require(commitDuration>0);
  	require(revealDuration>0);
  	require(bboRewards>0);

    bbs.setUint(keccak256('MIN_VOTES'), minVotes);
    bbs.setUint(keccak256('MAX_VOTES'), maxVotes);
    bbs.setUint(keccak256('VOTE_QUORUM'), voteQuorum);
    bbs.setUint(keccak256('STAKED_DEPOSIT'), stakeDeposit);
    bbs.setUint(keccak256('EVIDENCE_DURATION'), evidenceDuration);
    bbs.setUint(keccak256('COMMIT_DURATION'), commitDuration);
    bbs.setUint(keccak256('REVEAL_DURATION'), revealDuration);
    bbs.setUint(keccak256('BBO_REWARDS'), bboRewards);
  
  }
  function getVotingParams() public view returns(uint256, uint256,uint256,uint256, uint256,uint256,uint256, uint256){
  	return (bbs.getUint(keccak256('MIN_VOTES')), bbs.getUint(keccak256('MAX_VOTES')), bbs.getUint(keccak256('VOTE_QUORUM')), 
  	bbs.getUint(keccak256('STAKED_DEPOSIT')), bbs.getUint(keccak256('EVIDENCE_DURATION')), bbs.getUint(keccak256('COMMIT_DURATION')), 
  	bbs.getUint(keccak256('REVEAL_DURATION')), bbs.getUint(keccak256('BBO_REWARDS')));
  }

}