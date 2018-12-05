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
import './BBTCRHelper.sol';
import './zeppelin/token/ERC20/ERC20.sol';



contract BBUnOrderedTCR is BBStandard{
	// events
	event ItemApplied(uint256 indexed listID, bytes32 indexed itemHash, bytes data, uint256 applicationEndDate);
    event Challenge(uint256 indexed listID, bytes32 indexed itemHash, uint256 pollID, address sender);
    //
    BBVoting public voting = BBVoting(0x0);
    BBVotingHelper public votingHelper = BBVotingHelper(0x0);
    BBTCRHelper public tcrHelper = BBTCRHelper(0x0);
      
    function setVoting(address p) onlyOwner public  {
      voting = BBVoting(p);
    }
    function setVotingHelper(address p) onlyOwner public  {
      votingHelper = BBVotingHelper(p);
    }

    function setTCRHelper(address p) onlyOwner public  {
      tcrHelper = BBTCRHelper(p);
    }

    function getERC20(uint256 listID) public view returns(ERC20){
        return ERC20(tcrHelper.getToken(listID));
    }

    //Lam sao user bi remove, kiem tra so deposit
    function depositToken(uint256 listID, bytes32 itemHash, uint amount) public returns(bool) {
        (,,, uint256 minStake) = tcrHelper.getListParams(listID);
        uint256 staked = bbs.getUint(BBLib.toB32('TCR', listID, itemHash, 'STAKED'));
        require(staked.add(amount) >= minStake);
        require ( getERC20(listID).transferFrom(msg.sender, address(this), amount));
        bbs.setUint(BBLib.toB32('TCR', listID, itemHash, 'STAKED'), staked.add(amount));
        return true;
    }
    function apply(uint256 listID, uint256 amount, bytes32 itemHash, bytes data) public {
    	//TODO add index of item in the list
        require(tcrHelper.canApply(listID,itemHash, msg.sender));
        //
    	(uint256 applicationDuration,,,) = tcrHelper.getListParams(listID);
        require(depositToken(listID, itemHash,amount));
        // save creator
        bbs.setAddress(BBLib.toB32('TCR',listID, itemHash, 'OWNER'), msg.sender);
        // save application endtime
        uint256 applicationEndDate = block.timestamp.add(applicationDuration);
        bbs.setUint(BBLib.toB32('TCR', listID, itemHash, 'APPLICATION_ENDTIME'), applicationEndDate);
        bbs.setUint(BBLib.toB32('TCR',listID, itemHash,'STAGE'), 1);
        // emit event
        emit ItemApplied(listID, itemHash, data, applicationEndDate);
    }
    
    // lay balance - min stake >= _amount // set lai stake
    function withdraw(uint256 listID, bytes32 itemHash, uint _amount) external {
    	//TODO allow withdraw unlocked token
        require (tcrHelper.isOwnerItem(listID, itemHash, msg.sender));

        (,,, uint256 minStake) = tcrHelper.getListParams(listID);
        uint256 staked = bbs.getUint(BBLib.toB32('TCR', listID, itemHash, 'STAKED'));
        require(staked - minStake >= _amount);

        bbs.setUint(BBLib.toB32('TCR', listID, itemHash, 'STAKED'), staked.sub(_amount));
        assert( getERC20(listID).transfer(msg.sender, _amount));
    
    }
    
    function initExit(uint256 listID, bytes32 itemHash) external {	
    	//TODO Initialize an exit timer for a listing to leave the whitelist
        // exit timer 
        require (tcrHelper.isOwnerItem(listID, itemHash, msg.sender));
        require(bbs.getUint(BBLib.toB32('TCR',listID, itemHash,'STAGE')) == 3);
        uint256 applicationExitDuration = bbs.getUint(BBLib.toB32('TCR', listID, itemHash, 'EXITDURATION'));
        // save application exittime
        bbs.setUint(BBLib.toB32('TCR', listID, itemHash, 'EXITTIME'), block.timestamp.add(applicationExitDuration));
    }
    // set state = 0, tra tien so huu
    function finalizeExit(uint256 listID, bytes32 itemHash) external {
        // TODO Allow a listing to leave the whitelist
        // after x timer will 
        require (tcrHelper.isOwnerItem(listID, itemHash, msg.sender));
        require(bbs.getUint(BBLib.toB32('TCR',listID, itemHash,'STAGE')) == 3);
        uint256 applicationExitTime= bbs.getUint(BBLib.toB32('TCR', listID, itemHash, 'EXITTIME'));
        require(now > applicationExitTime);
        bbs.setUint(BBLib.toB32('TCR',listID, itemHash,'STAGE'), 0);

    }
    
    function challenge(uint256 listID, bytes32 itemHash, bytes _data) external returns (uint pollID) {
        // not in challenge stage
        require(bbs.getUint(BBLib.toB32('TCR',listID, itemHash,'STAGE')) != 2);
        // require deposit token        

        (, uint256 commitDuration, uint256 revealDuration, uint256 minStake) = tcrHelper.getListParams(listID);
        require ( getERC20(listID).transferFrom(msg.sender, address(this), minStake));
        
        pollID = voting.startPoll(_data, 0 , commitDuration, revealDuration);
        require(pollID > 0);
        // save pollID 
        bbs.setUint(BBLib.toB32('TCR', pollID, 'CHALLENGER_STAKED'), minStake);

        bbs.setUint(BBLib.toB32('TCR', listID, itemHash, 'POLL_ID'), pollID);
        bbs.setUint(BBLib.toB32('TCR_MAPPING_POLL_LIST', pollID), listID);
        
        bbs.setUint(BBLib.toB32('TCR_POLL_ID', pollID ), tcrHelper.calcRewardPool(listID, minStake));
        // save challenger
        bbs.setAddress(BBLib.toB32('TCR', listID, itemHash, 'CHALLENGER'), msg.sender);
        // in challenge stage
        bbs.setUint(BBLib.toB32('TCR',listID, itemHash,'STAGE'), 2);
        emit Challenge(listID, itemHash, pollID, msg.sender);
    }

    function updateStatus(uint256 listID, bytes32 itemHash) public {
        if (tcrHelper.canBeWhitelisted(listID, itemHash)) {
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
        uint256 listID = tcrHelper.getListID(pollID);
        assert(getERC20(listID).transfer(msg.sender, numReward));
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
        // quorum 70 --> lose
        // if nobody voted, ?? TODO
        (,,, bool hasVote, ) = votingHelper.getPollWinner(pollID);
        if (hasVote!=true) {
            return 2 * minStake;//TODO ... should reward to voter
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
            // did not pass // thang do khong pass, trang thai true -false,
            //remove ra khoi list
            bbs.setUint(BBLib.toB32('TCR',listID, itemHash,'STAGE'), 0);
            assert( getERC20(listID).transfer(bbs.getAddress(BBLib.toB32('TCR', listID, itemHash, 'CHALLENGER')), reward));
        }
    }
}