pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBLib.sol';



contract BBTCRHelper is BBStandard {

    event CreateListID(address indexed owner, uint256 indexed listID, address indexed tokenAddress, bytes nameHash);

    function createListID(bytes nameHash, address tokenAddress) onlyOwner public {
        uint256 listID = bbs.getUint(BBLib.toB32('TCR_LIST_ID'));
        listID++;
        bbs.setUint(BBLib.toB32('TCR_LIST_ID'), listID);
        updateToken(listID,tokenAddress);

        emit CreateListID(msg.sender, listID, tokenAddress, nameHash);
    }

    function updateToken(uint256 listID, address tokenAddress)  onlyOwner public { 
        require(tokenAddress != 0x0);
        bbs.setAddress(BBLib.toB32('TCR', listID, 'TOKEN'),tokenAddress);
    }

    function getToken(uint256 listID) public constant returns (address) {
        return bbs.getAddress(BBLib.toB32('TCR', listID, 'TOKEN'));
    } 

    function getListID(uint256 pollID) public constant returns(uint256){
        return bbs.getUint(BBLib.toB32('TCR_MAPPING_POLL_LIST', pollID));
    }


    function setParams(uint256 listID, uint256 applicationDuration, uint256 commitDuration, uint256 revealDuration, uint256 minStake, uint256 initQuorum, uint256 exitDuration) onlyOwner public  {
        bbs.setUint(BBLib.toB32('TCR', listID, 'APPLICATION_DURATION'), applicationDuration);
        bbs.setUint(BBLib.toB32('TCR', listID, 'COMMIT_DURATION'), commitDuration);
        bbs.setUint(BBLib.toB32('TCR', listID, 'REVEAL_DURATION'), revealDuration);
        bbs.setUint(BBLib.toB32('TCR', listID, 'MIN_STAKE'), minStake);
        bbs.setUint(BBLib.toB32('TCR', listID, 'QUORUM'), initQuorum);
        bbs.setUint(BBLib.toB32('TCR', listID, 'EXITDURATION'), exitDuration);
    }


    function getListParams(uint256 listID) public view returns(uint256 applicationDuration, uint256 commitDuration, uint256 revealDuration, uint256 minStake){
        applicationDuration = bbs.getUint(BBLib.toB32('TCR', listID, 'APPLICATION_DURATION'));
        commitDuration = bbs.getUint(BBLib.toB32('TCR', listID, 'COMMIT_DURATION'));
        revealDuration = bbs.getUint(BBLib.toB32('TCR', listID, 'REVEAL_DURATION'));
        minStake = bbs.getUint(BBLib.toB32('TCR', listID, 'MIN_STAKE'));
    }

    function getStakedBalance(uint256 listID, bytes32 itemHash) public constant returns (uint256) {
        return  bbs.getUint(BBLib.toB32('TCR', listID, itemHash, 'STAKED'));
    }

    function getItemStage(uint256 listID, bytes32 itemHash) public constant returns (uint256) {
        return  bbs.getUint(BBLib.toB32('TCR',listID, itemHash,'STAGE'));
    }

    function isOwnerItem(uint256 listID, bytes32 itemHash, address sender) public constant returns (bool r){
        address owner = bbs.getAddress(BBLib.toB32('TCR',listID, itemHash, 'OWNER'));
         r = (owner == sender && owner != address(0x0));
    }

    function canApply(uint256 listID, bytes32 itemHash, address sender) public constant returns (bool r){
        address owner = bbs.getAddress(BBLib.toB32('TCR',listID, itemHash, 'OWNER'));
         r = (owner == sender || owner == address(0x0));
    }
    function calcRewardPool(uint256 listID, uint256 stakedToken) public constant returns(uint256){
        uint oneHundred = 100; 
        return (oneHundred.sub(bbs.getUint(BBLib.toB32('TCR', listID, 'LOSE_PERCENT')))
            .mul(stakedToken)).div(100);
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

}
