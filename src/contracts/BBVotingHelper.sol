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

  function getPollResult(uint256 pollID) public view returns(uint256[], uint256[]){
    uint256 numOption = bbs.getUint(BBLib.toB32(pollID, 'OPTION_COUNTER'));
    uint256[] memory opts = new uint256[](numOption.add(1));
    uint256[] memory votes = new uint256[](numOption.add(1));
    for(uint256 i = 0; i <= numOption ; i++){
      opts[i] = i;
      votes[i] = (bbs.getUint(BBLib.toB32(pollID,'VOTE_FOR',opts[i])));
    }

    return (opts, votes);
  }
  function getPollID(uint256 pollType, uint256 relatedTo) public view returns(uint256 pollID){
    pollID = bbs.getUint(BBLib.toB32(relatedTo, pollType,'POLL'));
  }

  function getPollStage(uint256 pollID) public view returns(uint256, address, uint256, uint256, uint256){
    uint256 pollStatus = bbs.getUint(BBLib.toB32(pollID,'STATUS'));
    address creator = bbs.getAddress(BBLib.toB32(pollID, 'OWNER'));
    uint256 addPollOptionEndDate = bbs.getUint(BBLib.toB32(pollID,'ADDOPTION_ENDDATE'));
    uint256 commitEndDate = bbs.getUint(BBLib.toB32(pollID,'COMMIT_ENDDATE'));
    uint256 revealEndDate = bbs.getUint(BBLib.toB32(pollID,'REVEAL_ENDDATE'));
    return (pollStatus, creator, addPollOptionEndDate, commitEndDate, revealEndDate); 
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
  
  function getPollWinner(uint256 pollID) constant public returns(bool isFinished, uint256 winner, uint256 winnerVotes , bool hasVote, uint256 quorum) {
    (,,uint256 pollStatus,,uint256 revealEndDate) = getPollStage(pollID);
    isFinished = (revealEndDate <= now);
    if(pollStatus==2){
      hasVote = true;
      uint256 totalVotes = 0;
      (uint256[] memory addrs,uint256[] memory votes) = getPollResult(pollID);
      for(uint256 i=0;i<votes.length;i ++){
        totalVotes.add(votes[i]);
        if(winnerVotes<votes[i]){
          winnerVotes = votes[i];
          winner = addrs[i];
        }
        // to do if max == votes[i];
      }
      quorum = winnerVotes.mul(100).div(totalVotes);
    }
  }
  /**
  @param voter           Address of voter who voted in the majority bloc
  @param pollID          Integer identifier associated with target poll
  @return correctVotes    Number of tokens voted for winning option
  */
  function getNumPassingTokens(address voter, uint256 pollID) public constant returns (uint256 correctVotes) {
      (bool isFinished, uint256 winner,, bool hasVote,) = getPollWinner(pollID);
      if(isFinished==true && hasVote == true){
        uint256 userChoice = bbs.getUint(BBLib.toB32(pollID,'CHOICE', voter));
        if (winner == userChoice){
          correctVotes = bbs.getUint(BBLib.toB32(pollID ,'VOTES', voter));
        }
      }
  }
}