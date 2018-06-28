var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const DigitalContract =  artifacts.require("BigbomDigitalContract");
var contractAddr = '';
var bboDocHash = web3.utils.sha3('test docs');
bboDocHash  = bboDocHash.toString().substring(2);
//bboDocHash = web3.utils.toHex(bboDocHash);
console.log(web3.version)
contract('BigbomDigitalContract Test', async (accounts) => {

  it("user A sign first contract", async () => {
     let instance = await DigitalContract.new({from: accounts[0]});
     contractAddr = instance.address;
     console.log('contractAddr', contractAddr);
     var userA = accounts[1];
     console.log('userA', userA);
     var expiredTime = parseInt(Date.now()/1000) + 7 * 24 * 3600; // expired after 7 days
     console.log('expiredTime', expiredTime);
     console.log('bboDocHash', bboDocHash);
     var userSign = await web3.eth.sign(bboDocHash, userA, {from:userA});
     var assignAddress = [accounts[2]];
     await instance.createAndSignBBODocument(bboDocHash, userSign,  assignAddress, expiredTime, {from:userA});
     let signed = await instance.verifyBBODocument(bboDocHash, userSign);
     console.log('signed', signed);
     

     assert.equal(signed,  true);

     var docHashes = await instance.getDocuments(userA, {from:userA});
     console.log('docHash', docHashes);
     assert.equal('0x'+bboDocHash, docHashes[0][0]);
     assert.equal(expiredTime, docHashes[1][0]);
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

  it("user C send C signed should fail", async () => {
     var userC = accounts[3];
     console.log('userC', userC);

     var userSign = await web3.eth.sign(bboDocHash, userC, {from:userC});
     console.log('contractAddr', contractAddr);
     let instance = await DigitalContract.at(contractAddr);
     console.log('userSign', userSign);
     console.log('bboDocHash', bboDocHash);
     try
     {
         await instance.signBBODocument(bboDocHash, userSign, {from:userC});
         return false;
     }catch(e){
        return true;
     }
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
         return false;
     }catch(e){
     	return true;
     }
  });

  it("user C verifyBBODocument should fail", async () => {
     var userC = accounts[6];
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
     var userOwner = accounts[1];

     console.log('contractAddr', contractAddr);
     let instance = await DigitalContract.at(contractAddr);
     console.log('bboDocHash', bboDocHash);
     let addresses = await instance.getAddressesByDocHash(bboDocHash, {from:userOwner});
     console.log('addresses', addresses);
     assert.equal(addresses[0][0],  accounts[2]);
     assert.equal(addresses[0][1],  accounts[1]);
     assert.equal(addresses[1][0],  true);
     assert.equal(addresses[1][1],  true);
  });


})