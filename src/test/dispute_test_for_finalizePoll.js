var Web3 = require('web3');
var ipfsAPI = require('ipfs-api')
var Helpers = require('../helpers/helpers.js');

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
const BBOTest = artifacts.require("BBOTest");
const BBVoting = artifacts.require("BBVoting");
const BBVotingHelper = artifacts.require("BBVotingHelper");
const BBParams = artifacts.require("BBParams");
const BBDispute = artifacts.require("BBDispute");

var contractAddr = '';
var jobHash = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr';
var jobHashWilcancel = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr2';
var jobHash3 = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr3';
var jobHash4 = 'QmSn1wGTpz1cccc';
var jobHash5 = 'xvcxhccvv';
var jobHash6 = 'xvc3232dhccvv';


const files = [{
  path: 'README.md',
  content: 'text',
}]

var abi = require('ethereumjs-abi')
var BN = require('bignumber.js')

var proxyAddressJob = '';
var proxyAddressBid = '';
var proxyAddressPayment = '';
var proxyAddressVoting = '';
var proxyAddressVotingHelper = '';
var proxyAddressDispute = '';
var proxyAddressParams = '';
var bboAddress = '';
var storageAddress = '';

contract('Dispute Test for finalizePoll', async (accounts) => {

  it("initialize contract", async () => {

    // var filesrs = await ipfs.files.add(files);
    // jobHash = filesrs[0].hash;
    erc20 = await BBOTest.new({
      from: accounts[0]
    });
    bboAddress = erc20.address;

    // create storage

    let storage = await BBStorage.new({
      from: accounts[0]
    });

    storageAddress = storage.address;
    // create bb contract
    let jobInstance = await BBFreelancerJob.new({
      from: accounts[0]
    });
    let bidInstance = await BBFreelancerBid.new({
      from: accounts[0]
    });
    let paymentInstance = await BBFreelancerPayment.new({
      from: accounts[0]
    });
    let votingInstance = await BBVoting.new({
      from: accounts[0]
    });
   
    let votingRewardInstance = await BBDispute.new({
      from: accounts[0]
    });
    var votingHelperInstance = await BBVotingHelper.new({  from: accounts[0] });

    let paramsInstance = await BBParams.new({
      from: accounts[0]
    });

    // create proxyfactory
    let proxyFact = await ProxyFactory.new({
      from: accounts[0]
    });
    // create proxy to docsign
    const {
      logs
    } = await proxyFact.createProxy(accounts[8], jobInstance.address, {
      from: accounts[0]
    });
    proxyAddressJob = logs.find(l => l.event === 'ProxyCreated').args.proxy


    const l2 = await proxyFact.createProxy(accounts[8], bidInstance.address, {
      from: accounts[0]
    });
    proxyAddressBid = l2.logs.find(l => l.event === 'ProxyCreated').args.proxy


    const l3 = await proxyFact.createProxy(accounts[8], paymentInstance.address, {
      from: accounts[0]
    });
    proxyAddressPayment = l3.logs.find(l => l.event === 'ProxyCreated').args.proxy


    const l4 = await proxyFact.createProxy(accounts[8], votingInstance.address, {
      from: accounts[0]
    });
    proxyAddressVoting = l4.logs.find(l => l.event === 'ProxyCreated').args.proxy


    const l5 = await proxyFact.createProxy(accounts[8], paramsInstance.address, {
      from: accounts[0]
    });
    proxyAddressParams = l5.logs.find(l => l.event === 'ProxyCreated').args.proxy


    const l6 = await proxyFact.createProxy(accounts[8], votingRewardInstance.address, {
      from: accounts[0]
    });
    proxyAddressDispute = l6.logs.find(l => l.event === 'ProxyCreated').args.proxy


   
    const l8 = await proxyFact.createProxy(accounts[8], votingHelperInstance.address, { from: accounts[0]});
      proxyAddressVotingHelper = l8.logs.find(l => l.event === 'ProxyCreated').args.proxy


    // set admin to storage
    await storage.addAdmin(proxyAddressJob, true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressBid, true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressPayment, true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressVoting, true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressDispute, true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressParams, true, {
      from: accounts[0]
    });
   

    await storage.addAdmin(accounts[7], true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressVotingHelper, true, {from: accounts[0] });


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
   await bbo.transfer(accounts[6], 100000e18, {
      from: accounts[0]
    });
   await bbo.transfer(accounts[7], 100000e18, {
      from: accounts[0]
    });



    let job = await BBFreelancerJob.at(proxyAddressJob);
    await job.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await job.setStorage(storage.address, {
      from: accounts[0]
    });
    await job.setBBO(bboAddress, {
      from: accounts[0]
    });

    let bid = await BBFreelancerBid.at(proxyAddressBid);
    await bid.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await bid.setStorage(storage.address, {
      from: accounts[0]
    });
    await bid.setBBO(bboAddress, {
      from: accounts[0]
    });

    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    await payment.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await payment.setStorage(storage.address, {
      from: accounts[0]
    });
    await payment.setBBO(bboAddress, {
      from: accounts[0]
    });


    let votingHelper = await BBVotingHelper.at(proxyAddressVotingHelper);
    await votingHelper.transferOwnership(accounts[0], {from: accounts[0] });
    await votingHelper.setStorage(storage.address, {from: accounts[0] });
    await votingHelper.setBBO(bboAddress, {from: accounts[0] });
    
   
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
    await voting.setHelper(proxyAddressVotingHelper, {from: accounts[0] });


    let params = await BBParams.at(proxyAddressParams);
    await params.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await params.setStorage(storage.address, {
      from: accounts[0]
    });
    await params.setBBO(bboAddress, {
      from: accounts[0]
    });

    let votingReward = await BBDispute.at(proxyAddressDispute);
    await votingReward.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await votingReward.setStorage(storage.address, {
      from: accounts[0]
    });
    await votingReward.setBBO(bboAddress, {
      from: accounts[0]
    });
    await votingReward.setPayment(proxyAddressPayment, {
      from: accounts[0]
    })
    await votingReward.setVoting(proxyAddressVoting, {from: accounts[0] });
    await votingReward.setVotingHelper(proxyAddressVotingHelper, {from: accounts[0] });


    await bid.setPaymentContract(proxyAddressPayment, {
      from: accounts[0]
    });

    await job.setPaymentContract(proxyAddressPayment, {
      from: accounts[0]
    });
    await payment.addToken(bboAddress, true,{ from: accounts[0]});
    await payment.addToken('0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeebb0', true,{ from: accounts[0]});
  });


  it("set params", async () => {
    let params = await BBParams.at(proxyAddressParams);
    await params.addAdmin(accounts[0], true);
    await params.setVotingParams(100e18, 1000000e18, 300e18, 24 * 60 * 60, 24 * 60 * 60,
      24 * 60 * 60, 10e18, {
        from: accounts[0]
      });
    return true;
  });

  it("[Fail] Check is Admin BBParams", async () => {
    let params = await BBParams.at(proxyAddressParams);
    await params.addAdmin(accounts[0], true);
    try {
      await params.isAdmin(accounts[1], {
        from: accounts[0]
      });
      return false;
    } catch (e) {
      return true;
    }
  });

  var jobIDA;
  var jobIDB;
  var jobIDC;
  var jobIDD;
  var pollID;

  it("create job with dispute 3", async () => {
    console.log('bboAddress',bboAddress)
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[1];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var estimatedTime = 3 * 24 * 3600; // 3 days
    let l = await job.createJob(jobHash4 + 'kk', expiredTime, estimatedTime, 500e18, 'banner',bboAddress, {
      from: userA
    });
    jobIDA = l.logs.find(l => l.event === 'JobCreated').args.jobID;

    expiredTime = parseInt(Date.now() / 1000) + 90 * 24 * 3600;
    l = await job.createJob(jobHash5 + 'kk', expiredTime, estimatedTime, 500e18, 'banner',bboAddress, {
      from: userA
    });

    jobIDB = l.logs.find(l => l.event === 'JobCreated').args.jobID;

// 
    l = await job.createJob(jobHash6 + 'kk', expiredTime, estimatedTime, 500e18, 'banner',bboAddress, {
      from: userA
    });

    jobIDC = l.logs.find(l => l.event === 'JobCreated').args.jobID;

    let bbo = await BBOTest.at(bboAddress);
    let xxx = await bbo.balanceOf(userA, {
      from: userA
    });

    var userB = accounts[3];

    let xxxyn = await bbo.balanceOf(userA, {
      from: userA
    });
    let xxxzn = await bbo.balanceOf(userB, {
      from: userB
    });

    let bid = await BBFreelancerBid.at(proxyAddressBid);

    var timeDone = 3 * 24 * 3600; // 3 days
    await bid.createBid(jobIDA, 500e18, timeDone, {
      from: userB
    });


    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });
    await bid.acceptBid(jobIDA, userB, {
      from: userA
    });


    await job.startJob(jobIDA, {
      from: userB
    });
    await job.finishJob(jobIDA, {
      from: userB
    });
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    await payment.rejectPayment(jobIDA, 1, {
      from: userA
    });

    let xxxy = await bbo.balanceOf(userA, {
      from: userA
    });
    let xxxz = await bbo.balanceOf(userB, {
      from: userB
    });


    let voting = await BBDispute.at(proxyAddressDispute);
    let proofHash = 'proofHashxxkkpodid';
    await bbo.approve(voting.address, 0, {
      from: userB
    });

    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userB
    });

    let l222 = await voting.startDispute(jobIDA, proofHash, {
      from: userB
    });
   pollID = l222.logs.find(l => l.event === 'DisputeStarted').args.pollID;
    //User A AgainPoll

    await bbo.approve(voting.address, 0, {
      from: userA
    });

    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userA
    });


    await voting.againstDispute(jobIDA, proofHash + 'okman', {
      from: userA
    });



    let xxxzk = await bbo.balanceOf(userB, {
      from: userB
    });



    // //return;
    var userC = accounts[4];
    var userD = accounts[5];
    var userE = accounts[6];


    let votingRight = await BBVoting.at(proxyAddressVoting);

    await bbo.approve(votingRight.address, 0, {
      from: userC
    });
    await bbo.approve(votingRight.address, Math.pow(2, 255), {
      from: userC
    });

    await votingRight.requestVotingRights(200e18, {
      from: userC
    });

    await bbo.approve(votingRight.address, 0, {
      from: userD
    });
    await bbo.approve(votingRight.address, Math.pow(2, 255), {
      from: userD
    });

    await votingRight.requestVotingRights(200e18, {
      from: userD
    });

    await bbo.approve(votingRight.address, 0, {
      from: userE
    });
    await bbo.approve(votingRight.address, Math.pow(2, 255), {
      from: userE
    });

    l = await votingRight.requestVotingRights(200e18, {
      from: userE
    });

    
    let voter  = l.logs.find(l => l.event === 'VotingRightsGranted').args.voter;
    assert.equal(userE, voter);

  });

  it("fast forward to  1 after start poll 3333", function () {
    var fastForwardTime = 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

  


  it("commit vote ", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[4];
    var userD = accounts[5];
    var userE = accounts[6];

    let btcA = await  BBVotingHelper.at(proxyAddressVotingHelper).checkStakeBalance({
      from: userD
    });

    await voting.commitVote(pollID, web3.utils.soliditySha3(1, 123), 200e18, {
      from: userC
    });

    await voting.commitVote(pollID, web3.utils.soliditySha3(2, 124), 500e18, {
      from: userD
    });
    await voting.commitVote(pollID, web3.utils.soliditySha3(2, 124), 500e18, {
      from: userE
    });

    let btc = await BBVotingHelper.at(proxyAddressVotingHelper).checkStakeBalance({
      from: userD
    });

    assert(btcA < btc);

  });

  it("fast forward to  1 after start poll", function () {
    var fastForwardTime = 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

  it("[Fail] not votter reveal vote", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userE = accounts[6];

    try {
      await voting.revealVote(pollID, 1, 123, {
        from: userE
      });

      return false;
    } catch (e) {

      return true;
    }

  });

  it("[Fail] reveal vote with wrong choose 333", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[4];

    try {
      await voting.revealVote(pollID,6, 123, {
        from: userC
      });
      console.log('[Fail] reveal vote with wrong choose 333 OK');
      return false;
    } catch (e) {

      return true;
    }

  });



  it("reveal vote", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[4];
    var userD = accounts[5];
    var userE = accounts[6];
    console.log('pollID', pollID)
    let l = await voting.revealVote(pollID,1, 123, {
      from: userC
    });

    const a = l.logs.find(l => l.event === 'VoteRevealed').args

    let l2 = await voting.revealVote(pollID, 2, 124, {
      from: userD
    });
    voting.revealVote(pollID, 2, 124, {
      from: userE
    });

    let voter  = l2.logs.find(l => l.event === 'VoteRevealed').args.voter;

    //console.log(JSON.stringify(jobIDA));

    assert.equal(userD, voter);
  });

  


  it("checkHash", async () => {
    let voting = await BBVotingHelper.at(proxyAddressVotingHelper);
    var userC = accounts[4];

    let ll = await voting.checkHash(jobIDA,1, 123, {
      from: userC
    });

    assert.equal(1, ll);
  });

  //return;
  it("fast forward to 24h * 10 after start poll 3333", function () {
    var fastForwardTime = 10 * 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });


  

  it("claimReward  2", async () => {
    let c1 = await BBVotingHelper.at(proxyAddressVotingHelper).getPollStage(pollID);
    let c2 = await BBVotingHelper.at(proxyAddressVotingHelper).getPollResult(pollID);
    let c3 = await BBVotingHelper.at(proxyAddressVotingHelper).getPollWinner(pollID);

    var userC = accounts[4];
    var userD = accounts[5];
    var userE = accounts[6];

    let bbo = await BBOTest.at(bboAddress);
    await bbo.transfer(proxyAddressDispute, 10000000e18, {from:accounts[0]});
    let xxxyc = await bbo.balanceOf(userC, {
      from: userC
    });
    let xxxzc = await bbo.balanceOf(userD, {
      from: userD
    });

    let xxxzcx = await bbo.balanceOf(userE, {
      from: userE
    });


    let votingRight = await BBDispute.at(proxyAddressDispute);
    //console.log(JSON.stringify(jobIDA));

    await votingRight.claimReward(jobIDA, {
      from: userC
    });
    await votingRight.claimReward(jobIDA, {
      from: userD
    });
    await votingRight.claimReward(jobIDA, {
      from: userE
    });
    let z = await bbo.balanceOf(userE, {
      from: userE
    });

    assert(z > xxxzcx);

  });

  it("finalizePoll  ", async () => {
    var userB = accounts[3];

    let votingRight = await BBDispute.at(proxyAddressDispute);
 
    let l = await votingRight.finalizeDispute(jobIDA, {
      from: userB
    });
    const jobIDz = l.logs.find(l => l.event === 'DisputeFinalized').args.jobID
    //console.log(JSON.stringify(jobIDA));

    assert.equal(JSON.stringify(jobIDA),JSON.stringify(jobIDz));

  });

  it("[Fail] claimReward  Again ", async () => {
    try {

      var userC = accounts[4];

      let votingRight = await BBDispute.at(proxyAddressDispute);

      await votingRight.claimReward(jobIDA, {
        from: userC
      });;

      console.log('[Fail] claimReward  Again OK');
      return false;
    } catch (e) {
      return true;
    }

  });

  

  it("withdrawVotingRights ", async () => {

    var userC = accounts[4];
    var userD = accounts[5];
    var userE = accounts[6];

    let bbo = await BBOTest.at(bboAddress);

    let votingRight = await BBVoting.at(proxyAddressVoting);

    let l = await votingRight.withdrawVotingRights(200e18, {
      from: userC
    });

    const a = l.logs.find(l => l.event === 'VotingRightsWithdrawn').args
    assert.equal(userC, a.voter);

  });

  it("[Fail] withdrawVotingRights Again ", async () => {
    try {

      var userC = accounts[4];

      let votingRight = await BBVoting.at(proxyAddressVoting);

      await votingRight.withdrawVotingRights(200e18, {
        from: userC
      });

      return false;
    } catch (e) {
      return true;
    }

  });

  

  it("Job Ower win ", async () => {
    jobHash4 = jobHash5;
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[1];
    var userB = accounts[3];
    let bbo = await BBOTest.at(bboAddress);


    let bid = await BBFreelancerBid.at(proxyAddressBid);

    var timeDone = 3 * 24 * 3600; // 3 days
    await bid.createBid(jobIDB, 500e18, timeDone, {
      from: userB
    });

    await bid.acceptBid(jobIDB, userB, {
      from: userA
    });

    await job.startJob(jobIDB, {
      from: userB
    });
    await job.finishJob(jobIDB, {
      from: userB
    });
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    await payment.rejectPayment(jobIDB, 1, {
      from: userA
    });

    let voting = await BBDispute.at(proxyAddressDispute);
    let proofHash = 'proofHashxxkkpodiddd';
    await bbo.approve(voting.address, 0, {
      from: userB
    });

    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userB
    });

    let l333 = await voting.startDispute(jobIDB, proofHash, {
      from: userB
    });
    pollID = l333.logs.find(l => l.event === 'DisputeStarted').args.pollID;
    //User A AgainPoll

    await bbo.approve(voting.address, 0, {
      from: userA
    });

    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userA
    });


    await voting.againstDispute(jobIDB, proofHash + 'okmjjan', {
      from: userA
    });


    var userC = accounts[4];
    var userD = accounts[5];
    var userE = accounts[6];


    let votingRight = await BBVoting.at(proxyAddressVoting);

    await bbo.approve(votingRight.address, 0, {
      from: userC
    });
    await bbo.approve(votingRight.address, Math.pow(2, 255), {
      from: userC
    });

    await votingRight.requestVotingRights(200e18, {
      from: userC
    });

    await bbo.approve(votingRight.address, 0, {
      from: userD
    });
    await bbo.approve(votingRight.address, Math.pow(2, 255), {
      from: userD
    });

    await votingRight.requestVotingRights(200e18, {
      from: userD
    });

    await bbo.approve(votingRight.address, 0, {
      from: userE
    });
    await bbo.approve(votingRight.address, Math.pow(2, 255), {
      from: userE
    });

    let l = await votingRight.requestVotingRights(200e18, {
      from: userE
    });
    const a = l.logs.find(l => l.event === 'VotingRightsGranted').args
    assert.equal(userE, a.voter);


  });



  it("fast forward to  1 after start poll 3333", function () {
    var fastForwardTime = 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

  it("commit vote for job Ower Win", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[4];
    var userD = accounts[5];
    var userE = accounts[6];
    let bbo = await BBOTest.at(bboAddress);

    await voting.commitVote(pollID, web3.utils.soliditySha3(1, 123), 100e18, {
      from: userC
    });

    await voting.commitVote(pollID, web3.utils.soliditySha3(1, 124), 100e18, {
      from: userD
    });
    let y = await bbo.balanceOf(userE, {
      from: userE
    });
    await voting.commitVote(pollID, web3.utils.soliditySha3(1, 124), 100e18, {
      from: userE
    });
    let z = await bbo.balanceOf(userE, {
      from: userE
    });
    assert(y >= z);

  });

  it("fast forward to  1 after start poll ", function () {
    var fastForwardTime = 1 * 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });


  it("reveal vote ", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[4];
    var userD = accounts[5];
    var userE = accounts[6];

    await voting.revealVote(pollID,1, 123, {
      from: userC
    });
    await voting.revealVote(pollID,1, 124, {
      from: userD
    });
    let l  = await voting.revealVote(pollID,1, 124, {
      from: userE
    });
    const a = l.logs.find(l => l.event === 'VoteRevealed').args
    assert.equal(JSON.stringify(pollID), JSON.stringify(a.pollID));

  });

  it("fast forward to 24h * 10 after start poll 3333", function () {
    var fastForwardTime = 10 * 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

  it("finalizePoll JOB Owner Win ", async () => {
   
      let bbo = await BBOTest.at(bboAddress);
      var userA = accounts[1];
      var userB = accounts[3];

      let xxxyc = await bbo.balanceOf(userA, {
        from: userA
      });
      let xxxzc = await bbo.balanceOf(userB, {
        from: userB
      });

      let votingRight = await BBDispute.at(proxyAddressDispute);

     
      //claimReward
      await votingRight.finalizeDispute(jobIDB, {
        from: userB
      });

      let xxxy = await bbo.balanceOf(userA, {
        from: userA
      });
      let xxxz = await bbo.balanceOf(userB, {
        from: userB
      });

      //assert(xxxyc < xxxy);

  });


  //50 - 50
  it("Nobody win ", async () => {
    jobHash4 = jobHash6;
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[1];
    var userB = accounts[3];
    let bbo = await BBOTest.at(bboAddress);


    let bid = await BBFreelancerBid.at(proxyAddressBid);

    var timeDone = 3 * 24 * 3600; // 3 days
    await bid.createBid(jobIDC, 500e18, timeDone, {
      from: userB
    });

    await bid.acceptBid(jobIDC, userB, {
      from: userA
    });

    await job.startJob(jobIDC, {
      from: userB
    });
    await job.finishJob(jobIDC, {
      from: userB
    });
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    await payment.rejectPayment(jobIDC, 1, {
      from: userA
    });

    let voting = await BBDispute.at(proxyAddressDispute);
    let proofHash = 'proofHashxxkkpodiddd';
    await bbo.approve(voting.address, 0, {
      from: userB
    });

    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userB
    });

    let l444 =  await voting.startDispute(jobIDC, proofHash, {
      from: userB
    });
    pollID = l444.logs.find(l => l.event === 'DisputeStarted').args.pollID;

    //User A AgainPoll

    await bbo.approve(voting.address, 0, {
      from: userA
    });

    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userA
    });


    await voting.againstDispute(jobIDC, proofHash + 'okmjjan', {
      from: userA
    });


    var userC = accounts[4];
    var userD = accounts[5];
    var userE = accounts[6];


    let votingRight = await BBVoting.at(proxyAddressVoting);

    await bbo.approve(votingRight.address, 0, {
      from: userC
    });
    await bbo.approve(votingRight.address, Math.pow(2, 255), {
      from: userC
    });

    await votingRight.requestVotingRights(200e18, {
      from: userC
    });

    await bbo.approve(votingRight.address, 0, {
      from: userD
    });
    await bbo.approve(votingRight.address, Math.pow(2, 255), {
      from: userD
    });

    await votingRight.requestVotingRights(200e18, {
      from: userD
    });

    await bbo.approve(votingRight.address, 0, {
      from: userE
    });
    await bbo.approve(votingRight.address, Math.pow(2, 255), {
      from: userE
    });

    let a = await bbo.balanceOf(userE, {
      from: userE
    });

    await votingRight.requestVotingRights(200e18, {
      from: userE
    });
   
    let b = await bbo.balanceOf(userE, {
      from: userE
    });

    assert(a > b);
  });

  it("fast forward to  1 after start poll 3333", function () {
    var fastForwardTime = 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

  it("commit vote for Nobody win", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[4];
    var userD = accounts[5];
    let bbo = await BBOTest.at(bboAddress);
    let a = await bbo.balanceOf(userC, {
      from: userC
    });
    let x = await bbo.balanceOf(userD, {
      from: userD
    });


    await voting.commitVote(pollID, web3.utils.soliditySha3(2, 123), 100e18, {
      from: userC
    });

    await voting.commitVote(pollID, web3.utils.soliditySha3(1, 124), 100e18, {
      from: userD
    });

    let b = await bbo.balanceOf(userC, {
      from: userC
    });
    let y = await bbo.balanceOf(userD, {
      from: userD
    });

    assert(a >= b);
    assert(x >= y);

  });

  it("fast forward to  1 after start poll 3333", function () {
    var fastForwardTime = 1 * 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

  it("[Fail] not commit vote but reveal vote", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[6];

    try {
      await voting.revealVote(pollID, 2, 123, {
        from: userC
      });
      return false;

    } catch (e) {
      return true;
    }

  });

  it("reveal vote Nobody win", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[4];
    var userD = accounts[5];

    await voting.revealVote(pollID, 2, 123, {
      from: userC
    });
    let l = await voting.revealVote(pollID, 1, 124, {
      from: userD
    });

    const a = l.logs.find(l => l.event === 'VoteRevealed').args
    assert.equal(userD,a.voter);


  });

    
  it("fast forward to 24h * 10 after start poll 3333", function () {
    var fastForwardTime = 10 * 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

  it("finalizePoll Nobody win", async () => {
    
      let bbo = await BBOTest.at(bboAddress);
      var userA = accounts[1];
      var userB = accounts[3];

      let xxxzc = await bbo.balanceOf(userB, {
        from: userB
      });

      let votingRight = await BBDispute.at(proxyAddressDispute);

     await votingRight.finalizeDispute(jobIDC, {
        from: userB
      });

      let job = await BBFreelancerJob.at(proxyAddressJob);
      let l = await job.getJob(jobIDC, {
        from: userB
      });
      

  });

  it("emergencyERC20Drain", async () => {
    var userA = accounts[0];
    let bbo = await BBOTest.at(bboAddress);

    let a = await bbo.balanceOf(userA, {
      from: userA
    });

    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    var jobLog = await payment.emergencyERC20Drain(bbo.address, {
      from: userA
    });
    let b = await bbo.balanceOf(userA, {
      from: userA
    });


  });

  it("[Fail] reveal vote Nobody win affter finalizePoll", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[4];

    try {
      await voting.revealVote(pollID, 2, 123, {
        from: userC
      });
      return false;

    } catch (e) {
      return true;
    }

  });

});