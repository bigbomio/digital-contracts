  /**
 * Created on 2018-10-13 10:20
 * @summary: 
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBLib.sol';
import './BBVoting.sol';
import './BBVotingHelper.sol';


contract BBTCR is BBStandard{
	// events
	event ItemApplied(uint256 indexed listID, bytes32 indexed itemHash, bytes data);
    event Challenge(uint256 indexed listID, bytes32 indexed itemHash, uint256 pollID, address sender);
    //
    BBVoting public voting = BBVoting(0x0);
    BBVotingHelper public votingHelper = BBVotingHelper(0x0);
      
    function setVoting(address p) onlyOwner public  {
      voting = BBVoting(p);
    }
    function setVotingHelper(address p) onlyOwner public  {
      votingHelper = BBVotingHelper(p);
    }

    function getListParams(uint256 listID) public view returns(uint256 applicationDuration, uint256 commitDuration, uint256 revealDuration, uint256 minStake){
    	applicationDuration = bbs.getUint(BBLib.toB32('TCR', listID, 'APPLICATION_DURATION'));
        commitDuration = bbs.getUint(BBLib.toB32('TCR', listID, 'COMMIT_DURATION'));
        revealDuration = bbs.getUint(BBLib.toB32('TCR', listID, 'REVEAL_DURATION'));
    	minStake = bbs.getUint(BBLib.toB32('TCR', listID, 'MIN_STAKE'));
    }
    function depositToken(uint256 listID, bytes32 itemHash, uint amount) public returns(bool) {
        (,,, uint256 minStake) = getListParams(listID);
        uint256 staked = bbs.getUint(BBLib.toB32('TCR', listID, itemHash, 'STAKED'));
        require(staked.add(amount) >= minStake);
        require (bbo.transferFrom(msg.sender, address(this), amount));
        bbs.setUint(BBLib.toB32('TCR', listID, itemHash, 'STAKED'), staked.add(amount));
        return true;
    }
    function apply(uint256 listID, uint256 amount, bytes32 itemHash, bytes data) public {
    	//TODO add index of item in the list
        require(bbs.getAddress(BBLib.toB32('TCR',listID, itemHash, 'OWNER')) == 0x0);
        //
    	(uint256 applicationDuration,,,) = getListParams(listID);
        require(depositToken(listID, itemHash,amount));
        // save creator
        bbs.setAddress(BBLib.toB32('TCR',listID, itemHash, 'OWNER'), msg.sender);
        // save application endtime
        bbs.setUint(BBLib.toB32('TCR', listID, itemHash, 'APPLICATION_ENDTIME'), block.timestamp.add(applicationDuration));
        bbs.setUint(BBLib.toB32('TCR',listID, itemHash,'STAGE'), 1);
        // emit event
        emit ItemApplied(listID, itemHash, data);
    }
    
    function withdraw(uint256 listID, bytes32 itemHash, uint _amount) external {
    	//TODO allow withdraw unlocked token
    }
    function initExit(uint256 listID, bytes32 itemHash) external {	
    	//TODO Initialize an exit timer for a listing to leave the whitelist
    }
    function finalizeExit(uint256 listID, bytes32 itemHash) external {
        // TODO Allow a listing to leave the whitelist
    }
    function calcRewardPool(uint256 listID, uint256 stakedToken) internal constant returns(uint256){
        uint oneHundred = 100; 
        return (oneHundred.sub(bbs.getUint(BBLib.toB32('TCR', listID, 'LOSE_PERCENT'))).mul(stakedToken)).div(100);
    }
    function challenge(uint256 listID, bytes32 itemHash, bytes _data) external returns (uint pollID) {
        // not in challenge stage
        require(bbs.getUint(BBLib.toB32('TCR',listID, itemHash,'STAGE')) != 2);
        // require deposit token        
        (, uint256 commitDuration, uint256 revealDuration, uint256 minStake) = getListParams(listID);
        require (bbo.transferFrom(msg.sender, address(this), minStake));
        
        pollID = voting.startPoll(_data, 0 , commitDuration, revealDuration);
        require(pollID > 0);
        // save pollID 
        bbs.setUint(BBLib.toB32('TCR', pollID, 'CHALLENGER_STAKED'), minStake);

        bbs.setUint(BBLib.toB32('TCR', listID, itemHash, 'POLL_ID'), pollID);
        
        bbs.setUint(BBLib.toB32('TCR_POLL_ID', pollID ), calcRewardPool(listID, minStake));
        // save challenger
        bbs.setAddress(BBLib.toB32('TCR', listID, itemHash, 'CHALLENGER'), msg.sender);
        // in challenge stage
        bbs.setUint(BBLib.toB32('TCR',listID, itemHash,'STAGE'), 2);
        emit Challenge(listID, itemHash, pollID, msg.sender);
    }
    function updateStatus(uint256 listID, bytes32 itemHash) public {
        if (canBeWhitelisted(listID, itemHash)) {
            whitelistApplication(listID, itemHash);
        } else if (challengeCanBeResolved(listID, itemHash)) {
            resolveChallenge(listID, itemHash);
        } else {
            revert();
        }
    }
    function claimReward(uint pollID) public {
        require(bbs.getBool(BBLib.toB32('TCR_VOTER_CLAIMED', pollID, msg.sender)) == false);
        uint256 numReward = voterReward(msg.sender, pollID);
        require(numReward > 0);
        assert(bbo.transfer(msg.sender, numReward));
        bbs.setBool(BBLib.toB32('TCR_VOTER_CLAIMED', pollID, msg.sender), true);
    }
    function voterReward(address voter, uint pollID) public view returns (uint numReward) {
        if(bbs.getBool(BBLib.toB32('TCR_VOTER_CLAIMED', pollID, voter)) == false){
           uint256 userVotes =  votingHelper.getNumPassingTokens(voter, pollID);
            (bool isFinished,, uint256 winnerVotes,, uint256 quorum) = votingHelper.getPollWinner(pollID);
            if(isFinished==true && userVotes > 0 && quorum > 50){
                uint256 rewardPool =  bbs.getUint(BBLib.toB32('TCR_POLL_ID', pollID ));
                numReward = userVotes.mul(rewardPool).div(winnerVotes); // (vote/totalVotes) * staked
            }
        } 
        
    }
    function whitelistApplication(uint256 listID, bytes32 itemHash) private {
        bbs.setBool(BBLib.toB32('TCR',listID, itemHash,'WHITE_LISTED'), true);
        bbs.setUint(BBLib.toB32('TCR',listID, itemHash,'STAGE'), 3);
    }
    function canBeWhitelisted(uint256 listID, bytes32 itemHash) view public returns (bool) {
        uint256 applicationEndtime = bbs.getUint(BBLib.toB32('TCR', listID, itemHash, 'APPLICATION_ENDTIME'));
	    uint256 stage = bbs.getUint(BBLib.toB32('TCR',listID, itemHash,'STAGE'));
        if(applicationEndtime > 0 && applicationEndtime < now && stage == 1 && !isWhitelisted(listID, itemHash)){
            return true;
        }
        return false;
    }
	function isWhitelisted(uint256 listID, bytes32 itemHash) view public returns (bool whitelisted) {
        return bbs.getBool(BBLib.toB32('TCR',listID, itemHash,'WHITE_LISTED'));
	}

    function challengeCanBeResolved(uint256 listID, bytes32 itemHash) view public returns (bool) {
        uint pollID = bbs.getUint(BBLib.toB32('TCR', listID, itemHash, 'POLL_ID'));
        uint256 stage = bbs.getUint(BBLib.toB32('TCR',listID, itemHash,'STAGE'));
        require(stage == 2);
        (bool isFinished,,,,) = votingHelper.getPollWinner(pollID);
        return isFinished;
    }
    function determineReward(uint pollID) public view returns (uint) {
        uint256 minStake = bbs.getUint(BBLib.toB32('TCR', pollID, 'CHALLENGER_STAKED'));
        // Edge case, nobody voted, give all tokens to the challenger.
        (,,, bool hasVote, ) = votingHelper.getPollWinner(pollID);
        if (hasVote==true) {
            return 2 * minStake;
        }

        return (2 * minStake) - bbs.getUint(BBLib.toB32('TCR_POLL_ID', pollID ));
    }
    function resolveChallenge(uint256 listID, bytes32 itemHash) private {
        uint pollID = bbs.getUint(BBLib.toB32('TCR', listID, itemHash, 'POLL_ID'));
        (bool isFinished, , uint256 winnerVotes ,, uint256 quorum) = votingHelper.getPollWinner(pollID);
        uint256 initQuorum = bbs.getUint(BBLib.toB32('TCR', listID, 'QUORUM'));
        uint256 reward = determineReward(pollID);
        if(quorum>= initQuorum && isFinished == true && winnerVotes > 0){
            //pass vote
            whitelistApplication(listID, itemHash);
            uint256 staked = bbs.getUint(BBLib.toB32('TCR', listID, itemHash, 'STAKED'));
            bbs.setUint(BBLib.toB32('TCR', listID, itemHash, 'STAKED'), staked.add(reward));
        }else{
            // did not pass yet
            bbs.setUint(BBLib.toB32('TCR',listID, itemHash,'STAGE'), 0);
            bbs.setAddress(BBLib.toB32('TCR',listID, itemHash, 'OWNER'), address(0x0));
            assert(bbo.transfer(bbs.getAddress(BBLib.toB32('TCR', listID, itemHash, 'CHALLENGER')), reward));
        }
    }
}