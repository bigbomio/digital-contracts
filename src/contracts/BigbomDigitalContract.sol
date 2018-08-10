/**
 * Created on 2018-08-10 15:00
 * @summary: Smart Contract for signing a document between multiple parties using Ethereum private key
 * @author: tuanco
 */
pragma solidity ^0.4.24;

import './BBStorage.sol';
import './zeppelin/ownership/Ownable.sol';
import './zeppelin/ECRecovery.sol';

/**
 * @title: Contract for signing documents
 */
contract BigbomDigitalContract is Ownable {
  using ECRecovery for *;
  BBStorage bbs = BBStorage(0x0);

  mapping(bytes32=>bool) uniqueTemp;


  /**
   * @dev: 
   * @param storageAddress
   */
  function setStorage(address storageAddress) onlyOwner public {
    bbs = BBStorage(storageAddress);
  }
  /**
   * @dev: 
   */
  function getStorage()  onlyOwner public returns(address){
   
    return bbs;
  }
  // check the user is owner of his signature
  modifier userIsOwnerSign(bytes bboDocHash, bytes userSign){
  	require(bboDocHash.toEthSignedMessageHashBytes().recover(userSign) == msg.sender);
  	_;
  }

  //
  modifier isUniqueAddress(bytes bboDocHash, address[] addresses){
     for(uint i=0;i<addresses.length;i++){
       // not include msg.sender
       require(msg.sender!=addresses[i]);
       // check addresses is unique
       if(!uniqueTemp[keccak256(abi.encodePacked(bboDocHash,addresses[i]))]){
         uniqueTemp[keccak256(abi.encodePacked(bboDocHash,addresses[i]))] = true;
       }else{
         revert();
       }
     }
    _;
  }
  // get BBODocument by docHash
  /**
   * @dev: 
   * @param bboDocHash
   * @param userSign
   */
  function verifyBBODocument(bytes bboDocHash, bytes userSign) public view returns (bool) {
  	address userAddr = bboDocHash.toEthSignedMessageHashBytes().recover(userSign);
  	return keccak256(bbs.getBytes(keccak256(abi.encodePacked(bboDocHash,'signature', userAddr))))==keccak256(userSign);
  }

  // get list address & status by docHash
  /**
   * @dev: 
   * @param bboDocHash
   * @return address[]
   * @return bool[]
   */
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
  /**
   * @dev: 
   * @param addr
   * @return uint[]
   */
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
  /**
   * @dev: 
   * @param bboDocHash
   * @param userSign
   * @param pendingAddresses
   * @param expiredTimestamp
   */
  function createAndSignBBODocument(bytes bboDocHash, bytes userSign, address[] pendingAddresses, uint expiredTimestamp) public 
   userIsOwnerSign(bboDocHash, userSign)
   isUniqueAddress(bboDocHash, pendingAddresses)
   {
     // expiredTimestamp must > now
     require(expiredTimestamp > now);
     // docHash not existing
  	 require(bbs.getUint(keccak256(abi.encodePacked(bboDocHash))) == 0x0);

     // list pendingAddresses 
     require(pendingAddresses.length > 0);
  	 
     // maximum is 5 addresses
     require(pendingAddresses.length <=5);

     //new storage implements
     // save number user of this docs
     bbs.setUint(keccak256(abi.encodePacked(bboDocHash)), pendingAddresses.length + 1);
     // set time
     bbs.setUint(keccak256(abi.encodePacked(bboDocHash, 'expiredTimestamp')), expiredTimestamp);
     // save first address is owner of the docs
     bbs.setAddress(keccak256(abi.encodePacked(bboDocHash,'address')), msg.sender);
     // save owner sign
     bbs.setBytes(keccak256(abi.encodePacked(bboDocHash,'signature', msg.sender)), userSign);
     // todo save bboDocHash to user address
     setDocToAddress(msg.sender, bboDocHash);

     // loop & save in pendingAddresses 2^8
     for(uint i=0;i<pendingAddresses.length;i++){
        bbs.setAddress(keccak256(abi.encodePacked(bboDocHash, 'address', i+1)), pendingAddresses[i]);
        // save bboDocHash to user address
        setDocToAddress(pendingAddresses[i], bboDocHash);
     }
     emit BBODocumentSigned(bboDocHash, msg.sender);
     
  }

  /**
   * @dev: 
   * @param adr
   * @param docHash
   */
  function setDocToAddress(address adr, bytes docHash) internal {
    // get number of doc already
     uint256 docNumber = bbs.getUint(keccak256(abi.encodePacked(adr)));
     docNumber++;
     // incres 1
     bbs.setUint(keccak256(abi.encodePacked(adr)), docNumber);
     // set doc hash
     bbs.setBytes(keccak256(abi.encodePacked(adr, docNumber)), docHash);
  }

  /**
   * @dev: 
   * @param bboDocHash
   * @param userSign
   */
  function signBBODocument(bytes bboDocHash, bytes userSign)public 
   userIsOwnerSign(bboDocHash, userSign)
   {
     // check already docHash
     require(bbs.getUint(keccak256(abi.encodePacked(bboDocHash)))!=0x0);
     // check already sign
     require(keccak256(bbs.getBytes(keccak256(abi.encodePacked(bboDocHash,'signature', msg.sender))))!=keccak256(userSign));
     // check expired 
     require(bbs.getUint(keccak256(abi.encodePacked(bboDocHash, 'expiredTimestamp'))) > now);
     // save signature
     bbs.setBytes(keccak256(abi.encodePacked(bboDocHash,'signature', msg.sender)), userSign);
     emit BBODocumentSigned(bboDocHash, msg.sender);
  }

}
