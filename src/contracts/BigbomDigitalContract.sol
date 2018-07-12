pragma solidity ^0.4.24;

import './BBStorage.sol';
import './zeppelin/ownership/Ownable.sol';
import './zeppelin/ECRecovery.sol';

contract BigbomDigitalContract is Ownable {
  using ECRecovery for *;
  BBStorage bbs = BBStorage(0x0);
  function setStorage(address storageAddress) onlyOwner public {
    bbs = BBStorage(storageAddress);
  }

  function getStorage() onlyOwner public returns(address){
    return bbs;
  }
  // check the user is owner of his signature
  modifier userIsOwnerSign(bytes bboDocHash, bytes userSign){
  	require(bboDocHash.toEthSignedMessageHashBytes().recover(userSign) == tx.origin);
  	_;
  }

  // get BBODocument by docHash
  function verifyBBODocument(bytes bboDocHash, bytes userSign) public view returns (bool) {
  	address userAddr = bboDocHash.toEthSignedMessageHashBytes().recover(userSign);
  	return keccak256(bbs.getBytes(keccak256(abi.encodePacked(bboDocHash,'signature', userAddr))))==keccak256(userSign);
  }

  // get list address & status by docHash
  function getAddressesByDocHash(bytes bboDocHash) public view returns(address[], bool[]){

    uint docNum = bbs.getUint(keccak256(abi.encodePacked(bboDocHash)));
    address[] memory addresses = new address[](docNum);
    bool[] memory status = new bool[](docNum);
    for(uint i=0;i<docNum;i++){
      if(i==0)
      addresses[i] = bbs.getAddress(keccak256(abi.encodePacked(bboDocHash,'address')));
      else
      addresses[i] = bbs.getAddress(keccak256(abi.encodePacked(bboDocHash,'address', i)));

      status[i] = (keccak256(bbs.getBytes(keccak256(abi.encodePacked(bboDocHash,'signature', addresses[i]))))!=keccak256(""));
    }
    return (addresses, status);
  }
  
  
  //get list signed document of user
  function getDocuments(address addr) public view returns(bytes, uint[]){
    // get number of doc already
    bytes memory docReturn = '';
    uint256 docNumber = bbs.getUint(keccak256(abi.encodePacked(addr)));
    uint[] memory expiredTimestamps = new uint[] (docNumber);
    for(uint256 i=1;i<=docNumber;i++){
     bytes memory dochash = bbs.getBytes(keccak256(abi.encodePacked(addr, i)));
     docReturn = abi.encodePacked(docReturn, abi.encodePacked(dochash,','));
     expiredTimestamps[i-1]=bbs.getUint(keccak256(abi.encodePacked(dochash, 'expiredTimestamp')));
    }
    return (docReturn, expiredTimestamps);
  }
  
  // user Sign The Document
  event BBODocumentSigned(bytes bboDocHash, address indexed user);
  function createAndSignBBODocument(bytes bboDocHash, bytes userSign, address[] pendingAddresses, uint expiredTimestamp) public 
   userIsOwnerSign(bboDocHash, userSign)
   {
     // expiredTimestamp must > now
     require(expiredTimestamp > now);
     // docHash not existing
  	 require(bbs.getUint(keccak256(abi.encodePacked(bboDocHash))) == 0x0);

     // list pendingAddresses 
     require(pendingAddresses.length > 0);
  	 

     //new storage implements
     // save number user of this docs
     bbs.setUint(keccak256(abi.encodePacked(bboDocHash)), pendingAddresses.length + 1);
     // set time
     bbs.setUint(keccak256(abi.encodePacked(bboDocHash, 'expiredTimestamp')), expiredTimestamp);
     // save first address is owner of the docs
     bbs.setAddress(keccak256(abi.encodePacked(bboDocHash,'address')), tx.origin);
     // save owner sign
     bbs.setBytes(keccak256(abi.encodePacked(bboDocHash,'signature', tx.origin)), userSign);
     // todo save bboDocHash to user address
     setDocToAddress(tx.origin, bboDocHash);

     bool pendingAddressesIsValid = true;

     // loop & save in pendingAddresses 
     for(uint i=0;i<pendingAddresses.length;i++){
        if(tx.origin==pendingAddresses[i]){
         pendingAddressesIsValid = false;
         require(pendingAddressesIsValid==true);
        }
        bbs.setAddress(keccak256(abi.encodePacked(bboDocHash, 'address', i+1)), pendingAddresses[i]);
        // save bboDocHash to user address
        setDocToAddress(pendingAddresses[i], bboDocHash);

     }
     emit BBODocumentSigned(bboDocHash, tx.origin);
     
  }

  function setDocToAddress(address adr, bytes docHash) internal {
    // get number of doc already
     uint256 docNumber = bbs.getUint(keccak256(abi.encodePacked(adr)));
     docNumber++;
     // incres 1
     bbs.setUint(keccak256(abi.encodePacked(adr)), docNumber);
     // set doc hash
     bbs.setBytes(keccak256(abi.encodePacked(adr, docNumber)), docHash);
  }

  function signBBODocument(bytes bboDocHash, bytes userSign)public 
   userIsOwnerSign(bboDocHash, userSign)
   {
     // check already docHash
     require(bbs.getUint(keccak256(abi.encodePacked(bboDocHash)))!=0x0);
     // check already sign
     require(keccak256(bbs.getBytes(keccak256(abi.encodePacked(bboDocHash,'signature', tx.origin))))!=keccak256(userSign));
     // check expired 
     require(bbs.getUint(keccak256(abi.encodePacked(bboDocHash, 'expiredTimestamp'))) > now);
     // save signature
     bbs.setBytes(keccak256(abi.encodePacked(bboDocHash,'signature', tx.origin)), userSign);
     emit BBODocumentSigned(bboDocHash, tx.origin);
  }

}
