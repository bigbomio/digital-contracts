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
  function getPollDetail(uint256 pollID) public view returns(uint256, uint256, uint256, address, address, bool) {
    uint256 pollStatus = bbs.getUint(BBLib.toB32(pollID,'STATUS'));
    uint256 pollType = bbs.getUint(BBLib.toB32(pollID,'POLL_TYPE'));
    uint256 relatedTo = bbs.getUint(BBLib.toB32(pollID,'RELATED_TO'));
    address creator = bbs.getAddress(BBLib.toB32(pollID, 'POLL_STARTED'));
    address relatedAddr = bbs.getAddress(BBLib.toB32('POLL_RELATED', pollType));
    bool hasVote = bbs.getBool(BBLib.toB32(pollID, 'HAS_VOTE'));
    return (pollStatus, pollType, relatedTo, creator, relatedAddr, hasVote);
  }
  function getPollResult(uint256 pollID) public view returns(address[], uint256[]){
    uint256 numOption = bbs.getUint(BBLib.toB32(pollID, 'NUM_OPTION'));
    address[] memory addrs = new address[](numOption);
    uint256[] memory votes = new uint256[](numOption);
    for(uint i = 0; i < numOption ; i++){
      addrs[i] = bbs.getAddress(BBLib.toB32(pollID, 'OPTION_CREATOR', i+1));
      votes[i] = (bbs.getUint(BBLib.toB32(pollID,'VOTE_FOR',addrs[i])));
    }
    addrs[numOption+1] = address(0x0);
    votes[numOption+1] = (bbs.getUint(BBLib.toB32(pollID,'VOTE_FOR', address(0x0))));
    return (addrs, votes);
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
  * @param choice address 
  * @param salt salt
  */
  function checkHash(uint256 pollID, address choice, uint salt) public view returns(bool){
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
      r = (pollStatus == 1);
    }
  }

}