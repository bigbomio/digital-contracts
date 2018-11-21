var Web3 = require('web3');
var ipfsAPI = require('ipfs-api')
var Helpers = require('./../helpers/helpers.js');

var ipfs = ipfsAPI('ipfs.infura.io', '5001', {
  protocol: 'https'
});

const abiDecoder = require('abi-decoder'); 

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const BBStorage = artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
const BBOTest = artifacts.require("BBOTest");
const BBVoting = artifacts.require("BBVoting");
const BBVotingHelper = artifacts.require("BBVotingHelper");
const BBParams = artifacts.require("BBParams");
const BBTCRHelper = artifacts.require("BBTCRHelper");
const BBUnOrderedTCR = artifacts.require("BBUnOrderedTCR");

var contractAddr = '';

var optionID = 0;
var pollID = 0;

var proxyAddressVoting = '';
var proxyAddressVotingHelper = '';
var proxyAddressParams = '';
var bboAddress = '';
var storageAddress = '';
var proxyAddressTCR = '';
var proxyAddressTCRHelper = '';

contract('BBUnOrderedTCR Test', async (accounts) => {
  it("initialize  contract", async () => {

    var erc20 = await BBOTest.new({
      from: accounts[0]
    });
    bboAddress = erc20.address;
    var storage = await BBStorage.new({
      from: accounts[0]
    });
    storageAddress = storage.address;

    // create bb contract
    var votingInstance = await BBVoting.new({
      from: accounts[0]
    });
    var votingHelperInstance = await BBVotingHelper.new({
      from: accounts[0]
    });
    var paramsInstance = await BBParams.new({
      from: accounts[0]
    });
    var proxyFact = await ProxyFactory.new({
      from: accounts[0]
    });
    
    var TCRHelperInstance = await BBTCRHelper.new({
      from: accounts[0]
    });

    var unOrderedTCRInstance = await BBUnOrderedTCR.new({
      from: accounts[0]
    });
    const l4 = await proxyFact.createProxy(accounts[8], votingInstance.address, {
      from: accounts[0]
    });
    proxyAddressVoting = l4.logs.find(l => l.event === 'ProxyCreated').args.proxy

    const l6 = await proxyFact.createProxy(accounts[8], votingHelperInstance.address, {
      from: accounts[0]
    });
    proxyAddressVotingHelper = l6.logs.find(l => l.event === 'ProxyCreated').args.proxy

    const l7 = await proxyFact.createProxy(accounts[8], unOrderedTCRInstance.address, {
      from: accounts[0]
    });
    proxyAddressTCR = l7.logs.find(l => l.event === 'ProxyCreated').args.proxy

    const l8 = await proxyFact.createProxy(accounts[8], TCRHelperInstance.address, {
      from: accounts[0]
    });
    proxyAddressTCRHelper = l8.logs.find(l => l.event === 'ProxyCreated').args.proxy



    // set admin to storage
  
    await storage.addAdmin(proxyAddressVoting, true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressVotingHelper, true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressTCR, true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressTCRHelper, true, {
      from: accounts[0]
    });
    await storage.addAdmin(accounts[7], true, {
      from: accounts[0]
    });

    let bbo = await BBOTest.at(bboAddress);
    await bbo.transfer(accounts[1], 100000e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[2], 100000e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[3], 100000e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[4], 100000e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[5], 100000e18, {
      from: accounts[0]
    });


    let votingHelper = await BBVotingHelper.at(proxyAddressVotingHelper);
    await votingHelper.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await votingHelper.setStorage(storage.address, {
      from: accounts[0]
    });
    await votingHelper.setBBO(bboAddress, {
      from: accounts[0]
    });


    let voting = await BBVoting.at(proxyAddressVoting);
    await voting.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await voting.setStorage(storage.address, {
      from: accounts[0]
    });
    await voting.setBBO(bboAddress, {
      from: accounts[0]
    });
    await voting.setHelper(proxyAddressVotingHelper, {
      from: accounts[0]
    });

    //TCR Hepler 
    let TCRHelper = await BBTCRHelper.at(proxyAddressTCRHelper);
    await TCRHelper.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await TCRHelper.setStorage(storage.address, {
      from: accounts[0]
    });

    //BBUnOrderedTCR
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);
    await unOrderedTCR.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await unOrderedTCR.setStorage(storage.address, {
      from: accounts[0]
    });
    await unOrderedTCR.setVoting(proxyAddressVoting, {
      from: accounts[0]
    });
    await unOrderedTCR.setVotingHelper(proxyAddressVotingHelper, {
      from: accounts[0]
    });
    await unOrderedTCR.setBBO(bboAddress, {
      from: accounts[0]
    });
    await unOrderedTCR.setTCRHelper(proxyAddressTCRHelper, {
      from: accounts[0]
    });


  });
  var userA = accounts[0];
  var userB = accounts[1];
  var userC = accounts[2];
  var userD = accounts[3];
  var userE = accounts[4];
  var userF = accounts[5];


  var listID_0 = 0;
  var listID_1 = 0;
  it("createListID", async () => {
    let TCRHelper = await BBTCRHelper.at(proxyAddressTCRHelper);
    let bbo = await BBOTest.at(bboAddress);

    let l = await TCRHelper.createListID('assad',bbo.address,{ from: userA});

    let tokenAddress = l.logs.find(l => l.event === 'CreateListID').args.tokenAddress;
    listID_1 = l.logs.find(l => l.event === 'CreateListID').args.listID;
    assert.equal(bbo.address,tokenAddress);
  });

  it("[Fail] Not owner createListID", async () => {
    let TCRHelper = await BBTCRHelper.at(proxyAddressTCRHelper);
    let bbo = await BBOTest.at(bboAddress);
    try {
     await TCRHelper.createListID('assad',bbo.address,{ from: userB});
     return false;
    } catch(e) {
      return true;
    }
  
  });

  it("[Fail] not owner update Token ", async () => {
    let TCRHelper = await BBTCRHelper.at(proxyAddressTCRHelper);

    var erc20 = await BBOTest.new({
      from: accounts[0]
    });
    try {
     await TCRHelper.updateToken(listID_1 ,erc20.address,{ from: userB});
     return false;
    } catch(e) {
      return true;
    }
   
  });


  it("update Token ", async () => {
    let TCRHelper = await BBTCRHelper.at(proxyAddressTCRHelper);

    var erc20 = await BBOTest.new({
      from: accounts[0]
    });
     await TCRHelper.updateToken(listID_1 ,erc20.address,{ from: userA});
     
     let newToken = await TCRHelper.getToken(listID_1, { from: userA});

     assert.equal(erc20.address,newToken);
  });

  it("set & get params", async () => {
    let TCRHelper = await BBTCRHelper.at(proxyAddressTCRHelper);

     await TCRHelper.setParams(listID_0, 24 * 60 * 60, 24 * 60 * 60 * 2, 24 * 60 * 60, 1000e18,  100000, 24 * 60 * 60,{
      from: userA
    });

     await TCRHelper.getListParams(listID_0,{
      from: userA
    });

    return true;    
  });

  


  it("apply", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);

    let bbo = await BBOTest.at(bboAddress);

    await bbo.approve(unOrderedTCR.address, 0, {
      from: userB
    });
    await bbo.approve(unOrderedTCR.address, Math.pow(2, 255), {
      from: userB
    });

    await bbo.approve(unOrderedTCR.address, 0, {
      from: userC
    });
    await bbo.approve(unOrderedTCR.address, Math.pow(2, 255), {
      from: userC
    });

    await bbo.approve(unOrderedTCR.address, 0, {
      from: userD
    });
    await bbo.approve(unOrderedTCR.address, Math.pow(2, 255), {
      from: userD
    });

    await bbo.approve(unOrderedTCR.address, 0, {
      from: userE
    });
    await bbo.approve(unOrderedTCR.address, Math.pow(2, 255), {
      from: userE
    });


    await unOrderedTCR.apply(listID_0, 2000e18, 'ac', 'bc',  {
      from: userC
    });

    await unOrderedTCR.apply(listID_0, 3000e18, 'aa', 'bb',  {
      from: userD
    });

    let l = await unOrderedTCR.apply(listID_0, 2500e18, 'a', 'b',  {
      from: userB
    });

    let itemHash = l.logs.find(l => l.event === 'ItemApplied').args.itemHash;
    
    assert.equal('a', web3.utils.hexToUtf8(itemHash));
  });

  it("[Fail] apply again", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);
    try {
      await unOrderedTCR.apply(listID_0, 2000e18, 'ac', 'bc', {
        from: userC
      });
      return false;
    } catch (e) {
      return true;
    }

  });

  it("[Fail] apply with amount token < min stake", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);
    try {
      await unOrderedTCR.apply(listID_0, 10e18, 'ace', 'bc', {
        from: userE
      });
      console.log('[Fail] apply with amount token < min stake OK');
      return false;
    } catch (e) {
      return true;
    }
    
  });


  var pool_0;
  var pool_1;
  var optionID;

  it("challenge", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);
    let bbo = await BBOTest.at(bboAddress);

    await bbo.approve(unOrderedTCR.address, 0, {
      from: userE
    });
    await bbo.approve(unOrderedTCR.address, Math.pow(2, 255), {
      from: userE
    });

    await bbo.approve(unOrderedTCR.address, 0, {
      from: userD
    });
    await bbo.approve(unOrderedTCR.address, Math.pow(2, 255), {
      from: userD
    });

    await bbo.approve(unOrderedTCR.address, 0, {
      from: userF
    });
    await bbo.approve(unOrderedTCR.address, Math.pow(2, 255), {
      from: userF
    });

    let l = await unOrderedTCR.challenge(listID_0,'a', 'b',  {
      from: userE
    });

    let result = l.logs.find(l => l.event === 'Challenge').args;
    pool_0 = result.pollID;
    assert.equal(result.sender, userE);

    l = await unOrderedTCR.challenge(listID_0,'aa', 'b',  {
      from: userF
    });
    result = l.logs.find(l => l.event === 'Challenge').args;
    pool_1 = result.pollID;

  });

  it("isWhitelisted before update status", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);

     let c3 = await unOrderedTCR.isWhitelisted(listID_0, 'a',{
      from: userE
    });

    assert.equal('false' ,JSON.stringify(c3));

    c3 = await unOrderedTCR.isWhitelisted(listID_0, 'ac',{
      from: userE
    });

    assert.equal('false' ,JSON.stringify(c3));
  
  });

 
 
  it("reqest voting rights", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(voting.address, 0, {
      from: userC
    });
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userC
    });
    await bbo.approve(voting.address, 0, {
      from: userA
    });
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userA
    });
    let l = await voting.requestVotingRights(200e18, {
      from: userC
  });
  await voting.requestVotingRights(200e18, {
    from: userA
});
    const rs = l.logs.find(l => l.event === 'VotingRightsGranted').args.voter
    assert.equal(userC, rs);
});

it("fast forward to  1 day + 1 sec", function () {
  var fastForwardTime = 24 * 3600 * 1 +  1;
  return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
    return Helpers.sendPromise('evm_mine', []).then(function () {

    });
  });
});



it("commit vote ", async () => {  

  let voting = await BBVoting.at(proxyAddressVoting);
  var secretHash = web3.utils.soliditySha3(1, 123);
  let l = await voting.commitVote(pool_0, secretHash, 200e18, { from: userC });
  const rs = l.logs.find(l => l.event === 'VoteCommitted').args

  await voting.commitVote(pool_1, web3.utils.soliditySha3(0, 123), 200e18, { from: userC });
  await voting.commitVote(pool_1, web3.utils.soliditySha3(1, 123), 200e18, { from: userA });


  assert.equal(pool_0.toString(), rs.pollID.toString());
});


it("fast forward to  1 day + 1 sec", function () {
  var fastForwardTime = 24 * 3600 * 1 +  10;
  return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
    return Helpers.sendPromise('evm_mine', []).then(function () {

    });
  });
});

it("updateStatus whitelistApplication", async () => {
  let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);

  c3 = await unOrderedTCR.isWhitelisted(listID_0, 'ac',{
    from: userE
  });

  assert(c3 == false);

  await unOrderedTCR.updateStatus(listID_0, 'ac', {
    from: userC
  });

  c3 = await unOrderedTCR.isWhitelisted(listID_0, 'ac',{
    from: userE
  });

  assert(c3 == true);

});

it("reveal vote ", async () => {
  let voting = await BBVoting.at(proxyAddressVoting);
  let l = await voting.revealVote(pool_0, 1 , 123, { from: userC });
  const a = l.logs.find(l => l.event === 'VoteRevealed').args.pollID
  await voting.revealVote(pool_1, 0 , 123, { from: userC });
  await voting.revealVote(pool_1, 1 , 123, { from: userA });

  assert.equal(pool_0.toString(), a.toString());
});

it("fast forward to  1 day + 1 sec", function () {
  var fastForwardTime = 24 * 3600 * 1 +  10;
  return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
    return Helpers.sendPromise('evm_mine', []).then(function () {

    });
  });
});

it("getPollWinner", async () => {
  let c3 = await BBVotingHelper.at(proxyAddressVotingHelper).getPollWinner(pool_0);
  //console.log(JSON.stringify(c3));
  return true;
});


  it("fast forward to  1 day + 1 sec", function () {
    var fastForwardTime = 24 * 3600 * 2 +  10;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

  it("updateStatus resolveChallenge", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);

    await unOrderedTCR.updateStatus(listID_0, 'a', {
      from: userE
    });

   
    let c3 = await unOrderedTCR.isWhitelisted(listID_0, 'a',{
      from: userE
    });

    assert(c3 == false);
  });

  it("updateStatus resolveChallenge in draw voting", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);

    let bbo = await BBOTest.at(bboAddress);
    let xxxy = await bbo.balanceOf(userF, {
      from: userF
    });


    await unOrderedTCR.updateStatus(listID_0, 'aa', {
      from: userE
    });

    let xxxycc = await bbo.balanceOf(userF, {
      from: userF
    });

    assert(xxxy != xxxycc);
    
  });

  it("determineReward", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);

     let c3 = await unOrderedTCR.determineReward(listID_0,{
      from: userE
    });

    return true;
  
  });


  it("voterReward", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);

     let c3 = await unOrderedTCR.voterReward(userC, pool_0,{
      from: userE
    });

    return true;
  
  });

  it("claimReward", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);
    let bbo = await BBOTest.at(bboAddress);
    let xxxycc = await bbo.balanceOf(userC, {
      from: userC
    });

    //console.log('before', xxxycc);

     let c3 = await unOrderedTCR.claimReward( pool_0,{
      from: userC
    });

    let xxxyc = await bbo.balanceOf(userC, {
      from: userC
    });

    //console.log('after', xxxyc);

    assert(JSON.stringify(xxxyc) != JSON.stringify(xxxycc));
    //console.log(JSON.stringify(c3));
  
  });

  it("isWhitelisted", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);

     let c3 = await unOrderedTCR.isWhitelisted(listID_0, 'a',{
      from: userE
    });

    assert(c3 == false);
    c3 = await unOrderedTCR.isWhitelisted(listID_0, 'ac',{
      from: userE
    });

    assert(c3 == true);
  
  });


  it("getStakedBalance", async () => {
    let TCRHelper = await BBTCRHelper.at(proxyAddressTCRHelper);

     let c3 = await TCRHelper.getStakedBalance(listID_0, 'aa',{
      from: userD
    });

    assert(JSON.stringify (c3) != "0");
  
  });

  it("getItemStage", async () => {
    let TCRHelper = await BBTCRHelper.at(proxyAddressTCRHelper);

     let c3 = await TCRHelper.getItemStage(listID_0, 'aa',{
      from: userD
    });
    //console.log(c3);
    //assert(JSON.stringify (c3) != "0");
    return true;
  
  });



  it("withdraw", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);
    let bbo = await BBOTest.at(bboAddress);
    let xxxycc = await bbo.balanceOf(unOrderedTCR.address, {
      from: userC
    });
    
    await unOrderedTCR.withdraw(listID_0, 'aa', 1e18,{
      from: userD
    });

    xxxyc = await bbo.balanceOf(unOrderedTCR.address, {
      from: userC
    });
    
    assert(xxxycc != xxxyc);
  
  });

  it("[Fail] not owner initExit", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);
    
    try  {
    await unOrderedTCR.initExit(listID_0, 'ac', {
      from: userE
    });
    return false;

  } catch(e) {
    return true;
  }

    //return true;
  });

  it("initExit", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);
    
    await unOrderedTCR.initExit(listID_0, 'ac', {
      from: userC
    });

    return true;
  });

  it("[Fail] finalizeExit before endTime", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);
    
    try {
    await unOrderedTCR.finalizeExit(listID_0, 'ac', {
      from: userC
    });
    return false;
  } catch(e) {
    return true;
  }
  });

  it("fast forward to  1 day + 1 sec", function () {
    var fastForwardTime = 24 * 3600 * 4 +  10;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {
  
      });
    });
  });

  it("[Fail] not owner finalizeExit", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);
    try {
    await unOrderedTCR.finalizeExit(listID_0, 'ac', {
      from: userB
    });

    console.log('[Fail] not owner finalizeExit OK');
    return false;
  } catch(e) {
    return true;
  }
  });

  

  it("finalizeExit", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);
    
    await unOrderedTCR.finalizeExit(listID_0, 'ac', {
      from: userC
    });
  });

  it("[Fail] finalizeExit again", async () => {
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);
    try {
    await unOrderedTCR.finalizeExit(listID_0, 'ac', {
      from: userC
    });
    console.log('[Fail] finalizeExit again OK');
    return false;
  } catch(e) {
    return true;
  }
  });




});