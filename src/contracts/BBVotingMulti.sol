  /**
 * Created on 2018-10-23 15:20
 * @summary: 
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;

import './BBVoting.sol';
import './BBLib.sol';
/**
 * @title BBVotingMulti contract 
 */
contract BBVotingMulti is BBVoting{

  event PollStarted(uint256 pollID, uint256 indexed pollType, address indexed creator, uint256 indexed relatedTo);
  event PollOptionAdded(uint256 indexed pollID, address indexed creator, bytes pollOption);
  event PollUpdated(uint256 indexed pollID, bool indexed whiteFlag);


  function updatePoll(uint256 pollID, bool whiteFlag) public {
    (uint256 pollStatus, uint256 pollType, uint256 relatedTo,,address relatedAddr) = helper.getPollDetail(pollID);
    (,uint256 commitEndDate,uint256 revealEndDate) = helper.getPollStage(pollID);
    (, uint256 commitDuration,uint256 revealDuration,) = helper.getPollParams(pollType);
    require(pollStatus == 1);
    
    require(revealEndDate < now);
    if(whiteFlag){
      return _doWhiteFlag(pollID);
    }else{
      return _doExtendPoll(pollID, commitDuration, revealDuration);
    }
  }

  function _doWhiteFlag(uint256 pollID) private {
    //assert(_doWithdrawStakeToken(pollID));
    bbs.deleteBytes(BBLib.toB32(pollID, 'POLL_OPTION', msg.sender));
    emit PollUpdated(pollID, true );
  }
  function _doExtendPoll(uint256 pollID, uint256 commitDuration,uint256 revealDuration) private {
    bbs.setUint(BBLib.toB32(pollID,'COMMIT_ENDDATE'), block.timestamp.add(commitDuration));
    bbs.setUint(BBLib.toB32(pollID,'REVEAL_ENDDATE'), block.timestamp.add(commitDuration).add(revealDuration));
    emit PollUpdated(pollID, false);
  }

  
  function startPoll(address sender, uint256 pollType, uint256 relatedTo, bytes extraData) public {
    address relatedAddr = bbs.getAddress(BBLib.toB32('POLL_RELATED', pollType));
    // make sure the voting having the allowVoting method :v 
    if(sender== address(0x0))
      sender = msg.sender;
    
    require(helper.hasVoting(pollType, relatedTo)!=true);
    //TODO

    return _doStartPoll(sender, pollType, relatedTo, extraData);
  }
  function _doStartPoll(address sender, uint256 pollType, uint256 relatedTo, bytes extraData) private {
    //TODO
    (uint256 addOptionDuration, uint256 commitDuration,uint256 revealDuration, uint256 bboStake) = helper.getPollParams(pollType);
    // get current ID
    uint256 latestID  = bbs.getUint(BBLib.toB32('POLL_COUNTER'));
    uint256 pollID = latestID + 1;
    bbs.setUint(BBLib.toB32('POLL_COUNTER'), pollID);
    // assert(_doStakeToken( pollID, bboStake));
    // save startPoll address
    bbs.setAddress(BBLib.toB32(pollID, 'POLL_STARTED'), sender);
    bbs.setAddress(BBLib.toB32(pollID, 'OWNER'), msg.sender);
    
    // addPollOptionEndDate
    uint256 addPollOptionEndDate = block.timestamp.add(addOptionDuration);
    // commitEndDate
    uint256 commitEndDate = addPollOptionEndDate.add(commitDuration);
    // revealEndDate
    uint256 revealEndDate = commitEndDate.add(revealDuration);
    // save addPollOption, commit, reveal EndDate
    bbs.setUint(BBLib.toB32(pollID,'STATUS'), 1);
    bbs.setUint(BBLib.toB32(pollID,'ADDOPTION_ENDDATE'), addPollOptionEndDate);
    bbs.setUint(BBLib.toB32(pollID,'COMMIT_ENDDATE'), commitEndDate);
    bbs.setUint(BBLib.toB32(pollID,'REVEAL_ENDDATE'), revealEndDate);
    // save relatedTo
    bbs.setUint(BBLib.toB32(pollID,'RELATED_TO'), relatedTo);
    bbs.setUint(BBLib.toB32(pollID,'POLL_TYPE'), pollType);
    // save pollID to relatedTo
    bbs.setUint(BBLib.toB32(relatedTo, pollType,'POLL'), pollID);

    _doAddPollOption(pollID, extraData);

    emit PollStarted(pollID, pollType, sender, relatedTo);

  }
  
  function addPollOption(uint256 pollID, bytes pollOption) public {
    (uint256 pollStatus,, uint256 relatedTo,address creator,address relatedAddr) = helper.getPollDetail(pollID);
    require(pollStatus == 1);
    //todo check msg.sender
    require(bbs.getUint(BBLib.toB32(pollID,'ADDOPTION_ENDDATE')) > now);
    return _doAddPollOption(pollID, pollOption);
  }
  
  function _doAddPollOption(uint256 pollID, bytes optionHashIPFS) private {
    // check optionID make sure this hash not saved yet
    require(bbs.getUint(BBLib.toB32(pollID, 'OPTION', optionHashIPFS))== 0x0);
    // get latestID + 1 for new ID
    uint256 optionID = bbs.getUint(BBLib.toB32(pollID, 'OPTION_COUNTER')).add(1);
    // save latestID
    bbs.setUint(BBLib.toB32(pollID, 'OPTION_COUNTER'), optionID);
    // save option
    bbs.setBytes(BBLib.toB32(pollID, 'IPFS', optionID), optionHashIPFS);
    bbs.setAddress(BBLib.toB32(pollID, 'CREATOR', optionID), msg.sender);
    emit PollOptionAdded(pollID, msg.sender, optionHashIPFS);
  }
  
}
