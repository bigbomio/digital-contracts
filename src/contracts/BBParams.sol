pragma solidity ^0.4.24;

import './BBFreelancer.sol';

contract BBParams is BBFreelancer{

  function setFreelancerParams(uint256 paymentLimitTimestamp) onlyOwner public {
  	require(paymentLimitTimestamp > 0);
    bbs.setUint(keccak256(PAYMENT_LIMIT_TIMESTAMP), paymentLimitTimestamp);
  
  }
  function getFreelancerParams() public view returns(uint256){
  	return (bbs.getUint(keccak256(PAYMENT_LIMIT_TIMESTAMP)));
  }

  function setVotingParams(uint256 minVotes, uint256 maxVotes, uint256 voteQuorum,
   uint256 stakeDeposit, uint256 eveidenceDuration, uint256 commitDuration, 
   uint256 revealDuration, uint256 bboRewards, uint256 stakeVote) onlyOwner public {
  	require(minVotes > 0);
  	require(maxVotes>0);
  	require(voteQuorum>0);
  	require(stakeDeposit>0);
  	require(eveidenceDuration>0);
  	require(commitDuration>0);
  	require(revealDuration>0);
  	require(bboRewards>0);
  	require(stakeVote>0);

    bbs.setUint(keccak256(MIN_VOTES), minVotes);
    bbs.setUint(keccak256(MAX_VOTES), maxVotes);
    bbs.setUint(keccak256(VOTE_QUORUM), voteQuorum);
    bbs.setUint(keccak256(STAKED_DEPOSIT), stakeDeposit);
    bbs.setUint(keccak256(EVIDENCE_DURATION), eveidenceDuration);
    bbs.setUint(keccak256(COMMIT_DURATION), commitDuration);
    bbs.setUint(keccak256(REVEAL_DURATION), revealDuration);
    bbs.setUint(keccak256(BBO_REWARDS), bboRewards);
    bbs.setUint(keccak256(STAKED_VOTE), stakeVote);
  
  }
  function getVotingParams() public view returns(uint256, uint256,uint256,uint256, uint256,uint256,uint256, uint256,uint256){
  	return (bbs.getUint(keccak256(MIN_VOTES)), bbs.getUint(keccak256(MAX_VOTES)), bbs.getUint(keccak256(VOTE_QUORUM)), 
  	bbs.getUint(keccak256(STAKED_DEPOSIT)), bbs.getUint(keccak256(EVIDENCE_DURATION)), bbs.getUint(keccak256(COMMIT_DURATION)), 
  	bbs.getUint(keccak256(REVEAL_DURATION)), bbs.getUint(keccak256(BBO_REWARDS)), bbs.getUint(keccak256(STAKED_VOTE)));
  }

}