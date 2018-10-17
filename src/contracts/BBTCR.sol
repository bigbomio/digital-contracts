  /**
 * Created on 2018-10-13 10:20
 * @summary: 
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBLib.sol';
import './BBVoting.sol';
import './BBVotingInterface.sol';

contract BBTCR is BBStandard, BBVotingInterface{
	// events
	event ItemApplied(uint256 indexed listID, bytes32 indexed itemHash, bytes data);
    //
    function allowVoting(address sender, uint256 itemID) public view returns (bool){

    }
    function getListParams(uint256 listID) public view returns(uint256 applicationDuration, uint256 minStake, uint256 maxStake){
    	applicationDuration = bbs.getUint(BBLib.toB32('TCR', listID, 'APPLICATION_DURATION'));
    	minStake = bbs.getUint(BBLib.toB32('TCR', listID, 'MIN_STAKE'));
    	maxStake = bbs.getUint(BBLib.toB32('TCR', listID, 'MAX_STAKE'));
    }
    function depositToken(uint256 listID, bytes32 itemHash, uint amount) public returns(bool) {
        (, uint256 minStake, uint256 maxStake) = getListParams(listID);
        uint256 staked = bbs.getUint(BBLib.toB32('TCR', listID, itemHash, 'STAKED'));
        require(staked.add(amount) >= minStake);
        require(staked.add(amount) <= maxStake);
        require (bbo.transferFrom(msg.sender, address(this), amount));
        bbs.setUint(BBLib.toB32('TCR', listID, itemHash, 'STAKED'), staked.add(amount));
        return true;
    }
    function apply(uint256 listID, uint256 amount, bytes32 itemHash, bytes data) public {
    	//TODO add index of item in the list
    	(uint256 applicationDuration,,) = getListParams(listID);
        require(depositToken(listID, itemHash,amount));
        // save creator
        bbs.setAddress(BBLib.toB32('TCR',listID, itemHash, 'CREATOR'), msg.sender);
        // save application endtime
        bbs.setUint(BBLib.toB32('TCR', listID, itemHash, 'APPLICATION_ENDTIME'), block.timestamp.add(applicationDuration));
        // emit event
        emit ItemApplied(listID, itemHash, data);
    }
   
    function getItemStatus(uint256 listID, bytes32 itemHash) public view returns(uint256){
    	// get status
    }
    
    function withdraw(uint256 listID, bytes32 itemHash, uint _amount) external {
    	//TODO
    }
    function initExit(uint256 listID, bytes32 itemHash) external {	
    	//TODO
    }
    function finalizeExit(uint256 listID, bytes32 itemHash) external {

    }
    function challenge(uint256 listID, bytes32 itemHash, string _data) external returns (uint challengeID) {
        // TODO check allow challenge
        // require deposit token
        // voting.startPoll ?? how to resolve the msg.sender?
        // save status
    }
    function updateStatus(uint256 listID, bytes32 itemHash) public {

    }
    function claimReward(uint _challengeID) public {

    }
    function voterReward(address _voter, uint _challengeID)
    public view returns (uint) {

    }
    function canBeWhitelisted(uint256 listID, bytes32 itemHash) view public returns (bool) {
	}
	function isWhitelisted(uint256 listID, bytes32 itemHash) view public returns (bool whitelisted) {

	}
}