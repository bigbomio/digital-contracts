pragma solidity ^0.4.4;

import './zeppelin/ownership/Ownable.sol';
import './zeppelin/math/SafeMath.sol';
import './zeppelin/ECRecovery.sol';

contract BigbomDigitalContract {
  // BBODocument Struct
  struct BBODocument{
  	bytes32 docHash; //document Hash 
  	uint created; // created timestamp
  	uint updated; // updated timestamp
  	mapping(address => bytes) signedPersons; // mapping address, userSign
  }

  private uint documentNum;
  // mapping document Id, BBODocument
  private mapping(uint => BBODocument) bboDocuments;

  // mapping address, list of document Id
  private mapping(address => uint[]) userBBODocuments;

  // mapping document hash, document Id
  private mapping(bytes32 => uint) bboDocHashIds;

  // check user not sign this document yet
  modifier userNotSignedYet(bytes32 bboDocHash, bytes userSign) {
    BBODocument storage bboDoc = getBBODocument(bboDocHash);
    if(bboDoc){
    	require(bboDoc.signedPersons[msg.sender] != userSign);
    }
    _;
  }
  // check the user is owner of his signature
  modifier userIsOwnerSign(bytes32 bboDocHash, bytes userSign){
  	address userAddr = ECRecovery.recover(bboDocHash, userSign);
  	require(userAddr === msg.sender);
  	_;
  }
  // init constructor
  function BigbomDigitalContract() {
    // constructor
  }

  // get BBODocument Id by docHash
  function getBBODocHashId(bytes32 bboDocHash) private returns (uint) {
  	return bboDocHashIds[bboDocHash];
  }

  // get BBODocument by docHash
  function getBBODocument(bytes32 bboDocHash) public pure returns (BBODocument) {
  	uint bboDocId = getBBODocHashId(bboDocHash);
  	if (bboDocId > 0){
  		return bboDocuments[bboDocId];
  	}else{
  		return null;
  	}
  }

  function createBBODocument(bytes32 bboDocHash) private pure returns(uint bboDocId){
  	bboDocId = documentNum++;
  	bboDocuments[bboDocId] = BBODocument(docHash, now, now);
  	bboDocHashIds[bboDocHash] = bboDocId;
  }
  // user Sign The Document
  event BBODocumentSigned(bytes32 bboDocHash, bytes userSign, uint timestamp, address user);
  function signBBODocument(bytes32 bboDocHash, bytes userSign) public pure
   userIsOwnerSign(bboDocHash, userSign)
   userNotSignedYet(bboDocHash, userSign)
   {
  	 //TODO check input
  	 BBODocument storage bboDoc = getBBODocument(bboDocHash);
  	 if(!bboDoc){
  	 	bboDoc = bboDocuments[createBBODocument(bboDocHash)];
  	 }
  	 bboDoc.signedPersons[msg.sender] = userSign;
  	 bboDoc.updated = now;
  	 BBODocumentSigned(docHash, userSign, timestamp, msg.sender);
  }

}
