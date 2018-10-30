  /**
 * Created on 2018-08-13 10:20
 * @summary: 
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBLib.sol';

/**
 * @title BBVoting contract 
 */
contract BBVotingHelper is BBStandard{

  function getPollParams(uint256 pollType) public view returns(uint256, uint256, uint256, uint256){
    uint256 addOption = bbs.getUint(BBLib.toB32(pollType, 'ADDOPTION_DURATION'));
    uint256 commit = bbs.getUint(BBLib.toB32(pollType, 'COMMIT_DURATION'));
    uint256 reveal = bbs.getUint(BBLib.toB32(pollType, 'REVEAL_DURATION'));
    uint256 bboStake = bbs.getUint(BBLib.toB32(pollType, 'STAKED_DEPOSIT'));
    return (addOption, commit, reveal, bboStake);
  }
  function getPollDetail(uint256 pollID) public view returns(uint256, uint256, uint256, address, address) {
    uint256 pollStatus = bbs.getUint(BBLib.toB32(pollID,'STATUS'));
    uint256 pollType = bbs.getUint(BBLib.toB32(pollID,'POLL_TYPE'));
    uint256 relatedTo = bbs.getUint(BBLib.toB32(pollID,'RELATED_TO'));
    address creator = bbs.getAddress(BBLib.toB32(pollID, 'POLL_STARTED'));
    address relatedAddr = bbs.getAddress(BBLib.toB32('POLL_RELATED', pollType));
    return (pollStatus, pollType, relatedTo, creator, relatedAddr);
  }
  function getPollResult(uint256 pollID) public view returns(uint256[], uint256[]){
    uint256 numOption = bbs.getUint(BBLib.toB32(pollID, 'OPTION_COUNTER'));
    uint256[] memory opts = new uint256[](numOption);
    uint256[] memory votes = new uint256[](numOption);
    for(uint256 i = 0; i <= numOption ; i++){
      opts[i] = i;
      votes[i] = (bbs.getUint(BBLib.toB32(pollID,'VOTE_FOR',opts[i])));
    }

    return (opts, votes);
  }
  function getPollID(uint256 pollType, uint256 relatedTo) public view returns(uint256 pollID){
    pollID = bbs.getUint(BBLib.toB32(relatedTo, pollType,'POLL'));
  }

  function getPollStage(uint256 pollID) public view returns(uint256, uint256, uint256){
    uint256 addPollOptionEndDate = bbs.getUint(BBLib.toB32(pollID,'ADDOPTION_ENDDATE'));
    uint256 commitEndDate = bbs.getUint(BBLib.toB32(pollID,'COMMIT_ENDDATE'));
    uint256 revealEndDate = bbs.getUint(BBLib.toB32(pollID,'REVEAL_ENDDATE'));
    return (addPollOptionEndDate, commitEndDate, revealEndDate); 
  }
    /**
  * @dev check Hash for poll
  * @param pollID Job Hash
  * @param choice uint256 
  * @param salt salt
  */
  function checkHash(uint256 pollID, uint256 choice, uint salt) public view returns(bool){
    bytes32 choiceHash = BBLib.toB32(choice,salt);
    bytes32 secretHash = BBLib.bytesToBytes32(bbs.getBytes(BBLib.toB32(pollID,'SECRET_HASH',msg.sender)));
    return (choiceHash==secretHash);
  }
  function checkStakeBalance() public view returns(uint256 tokens){
    tokens = bbs.getUint(BBLib.toB32(msg.sender,'STAKED_VOTE'));
  }
  function hasVoting(uint256 pollType, uint256 relatedTo) public view returns(bool r){
    uint256 pollID = getPollID(pollType, relatedTo);
    if(pollID > 0) {
      uint256 pollStatus = bbs.getUint(BBLib.toB32(pollID,'STATUS'));
      uint256 revealEndDate = bbs.getUint(BBLib.toB32(pollID,'REVEAL_ENDDATE'));
      r = (pollStatus >= 1 && revealEndDate < now);
    }
  }
  function getPollOption(uint256 pollID, uint256 optID) public view returns(bytes opt){
    opt = bbs.getBytes(BBLib.toB32(pollID, 'IPFS_HASH', optID));
  }
  // /**
  // * @dev claimReward for poll
  // * @param pollID Job Hash
  // *
  // */
  // function claimReward(uint256 pollID) public {
  //   require(bbs.getUint(BBLib.toB32(pollID ,'REVEAL_ENDDATE'))<=now);
  //   require(bbs.getBool(BBLib.toB32(pollID ,'REWARD_CLAIMED', msg.sender))!= true);
  //   (uint256 numReward, bool win) = calcReward(pollID);
  //   require (numReward > 0);
  //   // set claimed to true
  //   bbs.setBool(BBLib.toB32(pollID ,'REWARD_CLAIMED',msg.sender), true);
  //   // todo senBBO
  //   require(bbo.transfer(msg.sender, numReward));
  // }
  // /**
  // * @dev calcReward calculate the reward
  // * @param pollID Job Hash
  // *
  // */
  // function calcReward(uint256 pollID) constant public returns(uint256 numReward, bool win){
  //   (bool isFinished, uint256 winner, bool hasVote) = getPollWinner(pollID);
  //   if(isFinished==true && hasVote == true){
  //     address choice = bbs.getAddress(BBLib.toB32(pollID, 'CHOICE',msg.sender));
  //     if(choice == winner){
  //       uint256 votes = bbs.getUint(BBLib.toB32(pollID, 'VOTES',msg.sender));
  //       uint256 totalVotes = bbs.getUint(BBLib.toB32(pollID, 'VOTE_FOR',choice));
  //       uint256 bboStake = bbs.getUint(BBLib.toB32(pollID, 'STAKED_DEPOSIT',choice));
  //       numReward = votes.mul(bboStake).div(totalVotes); // (vote/totalVotes) * staked
  //       win = true;
  //     }else{
  //       (,uint256 pollType,,,) = getPollDetail(pollID);
  //       numReward = bbs.getUint(BBLib.toB32(pollType, 'BBO_REWARDS'));
  //     }
  //   }
  // }
  function getPollWinner(uint256 pollID) constant public returns(bool isFinished, uint256 winner, bool hasVote) {
    (,,uint256 revealEndDate) = getPollStage(pollID);
    (uint256 pollStatus,,,,) = getPollDetail(pollID);
    isFinished = (revealEndDate <= now);
    if(pollStatus==2){
      hasVote = true;
      (uint256[] memory addrs,uint256[] memory votes) = getPollResult(pollID);
      uint256 max = 0;
      for(uint256 i=0;i<votes.length;i ++){
        if(max<votes[i]){
          max = votes[i];
          winner = addrs[i];
        }
      }
    }
  }
}