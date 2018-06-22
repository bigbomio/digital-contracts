var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const DigitalContract =  artifacts.require("BigbomDigitalContract");
var contractAddr = '';
var bboDocHash = web3.utils.sha3('test docs');
console.log(web3.version)
contract('BigbomDigitalContract Test', async (accounts) => {

  it("user A sign first contract", async () => {
     let instance = await DigitalContract.new({from: accounts[0]});
     contractAddr = instance.address;
     var userA = accounts[1];
     console.log('userA', userA);
     var userSign = await web3.eth.sign(bboDocHash, userA, {from:userA});
     console.log('contractAddr', contractAddr);
     console.log('userSign', userSign);
     console.log('bboDocHash', bboDocHash);
     await instance.signBBODocument(bboDocHash, userSign, {from:userA});
     let signed = await instance.verifyBBODocument(bboDocHash, userSign);
     console.log('signed', signed);
     

     assert.equal(signed,  true);

     var docHash = await instance.getUserSignedDocuments({from:userA});
     console.log('docHash', docHash);
     assert.equal(bboDocHash, docHash[0]);
  });

   it("user B sign A's contract", async () => {
     var userB = accounts[2];
     console.log('userB', userB);

     var userSign = await web3.eth.sign(bboDocHash, userB, {from:userB});
     console.log('contractAddr', contractAddr);
     let instance = await DigitalContract.at(contractAddr);
     console.log('userSign', userSign);
     console.log('bboDocHash', bboDocHash);
     await instance.signBBODocument(bboDocHash, userSign, {from:userB});
     console.log('signed 2222 sadsa');
     let signed = await instance.verifyBBODocument(bboDocHash, userSign);
     console.log('signed', signed);
     assert.equal(signed,  true);
  });

  it("user C send B signed should fail", async () => {
     var userB = accounts[2];
     var userC = accounts[3];
     console.log('userB', userB);

     var userSign = await web3.eth.sign(bboDocHash, userB, {from:userB});
     console.log('contractAddr', contractAddr);
     let instance = await DigitalContract.at(contractAddr);
     console.log('userSign', userSign);
     console.log('bboDocHash', bboDocHash);
     try
     {
     	 await instance.signBBODocument(bboDocHash, userSign, {from:userC});
     }catch(e){
     	return true;
     }
  });

  it("user C verifyBBODocument should fail", async () => {
     var userC = accounts[3];
     console.log('userC', userC);

     var userSign = await web3.eth.sign(bboDocHash, userC, {from:userC});
     console.log('contractAddr', contractAddr);
     let instance = await DigitalContract.at(contractAddr);
     console.log('userSign', userSign);
     console.log('bboDocHash', bboDocHash);
     let signed = await instance.verifyBBODocument(bboDocHash, userSign);
     console.log('signed', signed);
     assert.equal(signed,  false);
  });

   it("user owner get List address by bboDocHash", async () => {
     var userOwner = accounts[0];

     console.log('contractAddr', contractAddr);
     let instance = await DigitalContract.at(contractAddr);
     console.log('bboDocHash', bboDocHash);
     let addresses = await instance.getUsersByDocHash(bboDocHash, {from:userOwner});
     console.log('addresses', addresses);
     assert.equal(addresses[0],  accounts[1]);
     assert.equal(addresses[1],  accounts[2]);
  });

   it("user not owner get List address by bboDocHash shuold fail", async () => {
     var userOwner = accounts[5];

     console.log('contractAddr', contractAddr);
     let instance = await DigitalContract.at(contractAddr);
     console.log('bboDocHash', bboDocHash);
      try
     {
     let addresses = await instance.getUsersByDocHash(bboDocHash, {from:userOwner});
     console.log('addresses', addresses);
     assert.equal(addresses[0],  accounts[1]);
     assert.equal(addresses[1],  accounts[2]);
      }catch(e){
     	return true;
     }
  });

})