
pragma solidity ^0.4.24;

import './BBStandard.sol';


contract BBExpertHash is BBStandard {
	
	event SavingItemData(address indexed sender, bytes32 indexed itemHash, bytes ipfsHash);

	function pushData(bytes itemHash) public {
		require(msg.sender != 0x0);

		bbs.setBytes( keccak256(abi.encodePacked('IPFS_HASH', msg.sender)),  itemHash);

		emit SavingItemData(msg.sender, keccak256(abi.encodePacked(itemHash)), itemHash); 	
	}
}
