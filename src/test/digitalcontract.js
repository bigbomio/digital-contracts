var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const DigitalContract =  artifacts.require("BigbomDigitalContract");
var contractAddr = '';
var bboDocHash = web3.utils.soliditySha3('test docs');
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
     let signed = await instance.verifyBBODocument(bboDocHash, userSign);
     console.log('signed', signed);
     assert.equal(signed,  true);
  });



})