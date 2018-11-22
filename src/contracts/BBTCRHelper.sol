pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBLib.sol';



contract BBTCRHelper is BBStandard {

    function setParamsUnOrdered(uint256 listID, uint256 applicationDuration, uint256 commitDuration, uint256 revealDuration, uint256 minStake, uint256 initQuorum, uint256 exitDuration) onlyOwner public  {
        bbs.setUint(BBLib.toB32('TCR', listID, 'APPLICATION_DURATION'), applicationDuration);
        bbs.setUint(BBLib.toB32('TCR', listID, 'COMMIT_DURATION'), commitDuration);
        bbs.setUint(BBLib.toB32('TCR', listID, 'REVEAL_DURATION'), revealDuration);
        bbs.setUint(BBLib.toB32('TCR', listID, 'MIN_STAKE'), minStake);
        bbs.setUint(BBLib.toB32('TCR', listID, 'QUORUM'), initQuorum);
        bbs.setUint(BBLib.toB32('TCR', listID, 'EXITDURATION'), exitDuration);

    }

    function getParams(uint256 listID) public view returns(uint256 applicationDuration, uint256 commitDuration, uint256 revealDuration, uint256 minStake){
        applicationDuration = bbs.getUint(BBLib.toB32('TCR', listID, 'APPLICATION_DURATION'));
        commitDuration = bbs.getUint(BBLib.toB32('TCR', listID, 'COMMIT_DURATION'));
        revealDuration = bbs.getUint(BBLib.toB32('TCR', listID, 'REVEAL_DURATION'));
        minStake = bbs.getUint(BBLib.toB32('TCR', listID, 'MIN_STAKE'));
    }

    function getStakedBalanceUnOrdered(uint256 listID, bytes32 itemHash) public constant returns (uint256) {
        return  bbs.getUint(BBLib.toB32('TCR', listID, itemHash, 'STAKED'));
    }

    function getItemStage(uint256 listID, bytes32 itemHash) public constant returns (uint256) {
        return  bbs.getUint(BBLib.toB32('TCR',listID, itemHash,'STAGE'));
    }

}
