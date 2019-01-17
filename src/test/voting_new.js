var Web3 = require('web3');
var ipfsAPI = require('ipfs-api')
var Helpers = require('./../helpers/helpers.js');

var ipfs = ipfsAPI('ipfs.infura.io', '5001', {
  protocol: 'https'
});

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const BBFreelancerJob = artifacts.require("BBFreelancerJob");
const BBFreelancerBid = artifacts.require("BBFreelancerBid");
const BBFreelancerPayment = artifacts.require("BBFreelancerPayment");
const BBStorage = artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
const BBToken = artifacts.require("BBToken");
const BBVoting = artifacts.require("BBVoting");
const BBVotingHelper = artifacts.require("BBVotingHelper");
const BBParams = artifacts.require("BBParams");
const BBDispute = artifacts.require("BBDispute");

var contractAddr = '';
var jobHash = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr';
var jobHashWilcancel = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr2';
var jobHash3 = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr3';
var jobHash4 = 'QmSn1wGTpz1';
var jobHash5 = 'QmSn1wGTpz2'
var jobID=1;
var optionID = 0;
var pollID=0;
var proxyAddressJob = '';
var proxyAddressBid = '';
var proxyAddressPayment = '';
var proxyAddressVoting = '';
var proxyAddressVotingHelper = '';
var proxyAddressParams = '';
var bboAddress = '';
var storageAddress = '';
contract('Voting Test', async (accounts) => {
  it("initialize  contract", async () => {
    var erc20 = await BBToken.new('Bigbom', 'BBO', 18,{from: accounts[0]});
    bboAddress = erc20.address;
    var storage = await BBStorage.new({ from: accounts[0]});
    storageAddress = storage.address;
  
    // create bb contract
    var jobInstance = await BBFreelancerJob.new({from: accounts[0]});
    var bidInstance = await BBFreelancerBid.new({from: accounts[0]});
    var paymentInstance = await BBFreelancerPayment.new({ from: accounts[0] });
    var votingInstance = await BBVoting.new({  from: accounts[0] });
    var votingHelperInstance = await BBVotingHelper.new({  from: accounts[0] });
    var paramsInstance = await BBParams.new({  from: accounts[0] });
    var proxyFact = await ProxyFactory.new({  from: accounts[0] });
    var disputeInstance = await BBDispute.new({from: accounts[0]});
    

    const l1 = await proxyFact.createProxy(accounts[8], jobInstance.address, {from: accounts[0]});
    proxyAddressJob = l1.logs.find(l => l.event === 'ProxyCreated').args.proxy

    const l2 = await proxyFact.createProxy(accounts[8], bidInstance.address, {from: accounts[0]});
    proxyAddressBid = l2.logs.find(l => l.event === 'ProxyCreated').args.proxy


      const l3 = await proxyFact.createProxy(accounts[8], paymentInstance.address, { from: accounts[0] });
      proxyAddressPayment = l3.logs.find(l => l.event === 'ProxyCreated').args.proxy

      const l4 = await proxyFact.createProxy(accounts[8], votingInstance.address, { from: accounts[0]});
      proxyAddressVoting = l4.logs.find(l => l.event === 'ProxyCreated').args.proxy

      const l5 = await proxyFact.createProxy(accounts[8], paramsInstance.address, {from: accounts[0]});
      proxyAddressParams = l5.logs.find(l => l.event === 'ProxyCreated').args.proxy

      const l6 = await proxyFact.createProxy(accounts[8], votingHelperInstance.address, { from: accounts[0]});
      proxyAddressVotingHelper = l6.logs.find(l => l.event === 'ProxyCreated').args.proxy



    // set admin to storage
    await storage.addAdmin(proxyAddressJob, true, {from: accounts[0] });
    await storage.addAdmin(proxyAddressBid, true, {from: accounts[0] });
    await storage.addAdmin(proxyAddressPayment, true, {from: accounts[0] });
    await storage.addAdmin(proxyAddressVoting, true, {from: accounts[0] });
    await storage.addAdmin(proxyAddressVotingHelper, true, {from: accounts[0] });
    await storage.addAdmin(proxyAddressParams, true, {from: accounts[0] });

    await storage.addAdmin(accounts[7], true, {from: accounts[0] });


    let bbo = await BBToken.at(bboAddress);
    await bbo.transfer(accounts[1], 100000e18, {from: accounts[0] });
    await bbo.transfer(accounts[2], 100000e18, {from: accounts[0] });
    await bbo.transfer(accounts[3], 100000e18, {from: accounts[0] });
    await bbo.transfer(accounts[4], 100000e18, {from: accounts[0] });
    await bbo.transfer(accounts[5], 900e18, {from: accounts[0] });




    let job = await BBFreelancerJob.at(proxyAddressJob);
    await job.transferOwnership(accounts[0], {from: accounts[0] });
    await job.setStorage(storage.address, {from: accounts[0] });
    await job.setBBO(bboAddress, {from: accounts[0] });

    let bid = await BBFreelancerBid.at(proxyAddressBid);
    await bid.transferOwnership(accounts[0], {from: accounts[0] });
    await bid.setStorage(storage.address, {from: accounts[0] });
    await bid.setBBO(bboAddress, {from: accounts[0] });

    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    await payment.transferOwnership(accounts[0], {from: accounts[0] });
    await payment.setStorage(storage.address, {from: accounts[0] });
    await payment.setBBO(bboAddress, {from: accounts[0] });

    let votingHelper = await BBVotingHelper.at(proxyAddressVotingHelper);
    await votingHelper.transferOwnership(accounts[0], {from: accounts[0] });
    await votingHelper.setStorage(storage.address, {from: accounts[0] });
    await votingHelper.setBBO(bboAddress, {from: accounts[0] });
    

    let voting = await BBVoting.at(proxyAddressVoting);
    await voting.transferOwnership(accounts[0], {from: accounts[0] });
    await voting.setStorage(storage.address, {from: accounts[0] });
    await voting.setBBO(bboAddress, {from: accounts[0] });
    await voting.setHelper(proxyAddressVotingHelper, {from: accounts[0] });


    let params = await BBParams.at(proxyAddressParams);
    await params.transferOwnership(accounts[0], {from: accounts[0] });
    await params.setStorage(storage.address, {from: accounts[0] });
    await params.setBBO(bboAddress, {from: accounts[0] });

    

    await bid.setPaymentContract(proxyAddressPayment, {from: accounts[0] });
    await job.setPaymentContract(proxyAddressPayment, {from: accounts[0] });
    await payment.addToken(bboAddress, true,{ from: accounts[0]});
    await payment.addToken('0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeebb0', true,{ from: accounts[0]});
});


it("set params", async () => {
    let params = await BBParams.at(proxyAddressParams);
    await params.addAdmin(accounts[0], true);
    await params.setPollType(1, proxyAddressJob);// set job
    await params.setVotingParams( 100e18, 1000000e18, 100e18, 24 * 60 * 60, 24 * 60 * 60,
      24 * 60 * 60, 10e18, { from: accounts[0] });
    return true;
});

it("start poll", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    let proofHash = 'proofHash';
    var userB = accounts[2];
    let l = await voting.startPoll( proofHash, 86400,86400,86400,{ from: userB });
    optionID = l.logs.find(l => l.event === 'PollOptionAdded').args.optionID
    pollID = l.logs.find(l => l.event === 'PollStarted').args.pollID;
});
it("get Poll Option", async () => {
    let voting = await BBVotingHelper.at(proxyAddressVotingHelper);
    let proofHash = 'proofHash';
    let l = await voting.getPollOption(pollID, optionID);
   
    assert.equal(web3.utils.hexToUtf8(l), proofHash);
    console.log('pollID', pollID);
    let v = await voting.getPollResult(pollID);
    console.log(v[0]);
    console.log(v[1]);
});

it("add Poll Option", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    let proofHash = 'proofHashAgainst';
    var userA = accounts[0];
    var userB = accounts[2];
    let l = await voting.addPollOption( pollID , proofHash, { from: userB });

    const pollIDRs = l.logs.find(l => l.event === 'PollOptionAdded').args.pollID
    assert.equal(pollID.toString(), pollIDRs.toString());
});

it("reqest voting rights", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[1];
    let bbo = await BBToken.at(bboAddress);
    await bbo.approve(voting.address, 0, {
      from: userC
    });
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userC
    });
    let l = await voting.requestVotingRights(200e18, {
      from: userC
  });
    const rs = l.logs.find(l => l.event === 'VotingRightsGranted').args.voter
    assert.equal(userC, rs);
});
it("fast forward to 24h after start poll", function() {
    var fastForwardTime = 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function() {
      return Helpers.sendPromise('evm_mine', []).then(function() {


      });
  });
});

it("commit vote ", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[1];
    var secretHash = web3.utils.soliditySha3(1, 123);
    let l = await voting.commitVote(pollID, secretHash, 200e18, { from: userC });
    const rs = l.logs.find(l => l.event === 'VoteCommitted').args.pollID
    assert.equal(pollID.toString(), rs.toString());
});
it("re-commit vote ", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[1];
    var secretHash = web3.utils.soliditySha3(1, 123);
    let l = await voting.commitVote(pollID, secretHash, 300e18, { from: userC });
    const rs = l.logs.find(l => l.event === 'VoteCommitted').args.pollID
    assert.equal(pollID.toString(), rs.toString());
});
it("fast forward to 24h after commit vote poll", function() {
    var fastForwardTime = 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function() {
      return Helpers.sendPromise('evm_mine', []).then(function() {

      });
  });
});
it("reveal vote ", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[1];
    let l = await voting.revealVote(pollID, 1 , 123, { from: userC });
    const a = l.logs.find(l => l.event === 'VoteRevealed').args.pollID
    assert.equal(pollID.toString(), a.toString());
});


it("start poll jobHash5", async () => {
    jobID = 4;
    let voting = await BBVoting.at(proxyAddressVoting);
    let proofHash = 'proofHash';
    var userB = accounts[2];
    let l = await voting.startPoll( proofHash, 86400,86400,86400, { from: userB });
    pollID = l.logs.find(l => l.event === 'PollStarted').args.pollID;
});
it("add Poll Option jobHash5", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    let proofHash = 'proofHashAgainst';
    var userA = accounts[0];
    var userB = accounts[2];
    let l = await voting.addPollOption( pollID , proofHash, { from: userB });

    const pollIDRs = l.logs.find(l => l.event === 'PollOptionAdded').args.pollID
    assert.equal(pollID.toString(), pollIDRs.toString());
});

it("fast forward to 24h after commit vote poll jobHash5", function() {
    var fastForwardTime = 4 * 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function() {
      return Helpers.sendPromise('evm_mine', []).then(function() {

      });
  });
});
it("extend time when no one commit vote", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userB = accounts[2];
    let l = await voting.updatePoll(pollID, false, 86400,86400, { from: userB });
    const rs = l.logs.find(l => l.event === 'PollUpdated').args.pollID
    const whiteFlag = l.logs.find(l => l.event === 'PollUpdated').args.isCancel
    assert.equal(pollID.toString(), rs.toString());
    assert.equal(false, whiteFlag);
});
it("fast forward to 24h after extend vote poll jobHash5", function() {
    var fastForwardTime = 4 * 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function() {
      return Helpers.sendPromise('evm_mine', []).then(function() {

      });
  });
});
it("white-flag Poll when no one commit vote", async () => {

    let bbo = await BBToken.at(bboAddress);
    var userB = accounts[2];
    let voting = await BBVoting.at(proxyAddressVoting);
    
    let l = await voting.updatePoll(pollID, true,  86400,86400,{ from: userB });
    const rs = l.logs.find(l => l.event === 'PollUpdated').args.pollID
    const whiteFlag = l.logs.find(l => l.event === 'PollUpdated').args.isCancel
    assert.equal(pollID.toString(), rs.toString());
    assert.equal(true, whiteFlag);
});
it("[FAIL] white-flag Poll again should fail", async () => {

    let bbo = await BBToken.at(bboAddress);
    var userA = accounts[0];
    let voting = await BBVoting.at(proxyAddressVoting);
    try{
        let l = await voting.updatePoll(pollID, true, { from: userA });
    }catch(e){
        return true;
    }
    
});
});