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
const BBOTest = artifacts.require("BBOTest");
const BBVoting = artifacts.require("BBVoting");
const BBParams = artifacts.require("BBParams");
const BBDispute = artifacts.require("BBDispute");
const BBRating = artifacts.require("BBRating");


var contractAddr = '';
var jobHash = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr';
var jobHashWilcancel = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr2';
var jobHash3 = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr3';
var jobHash4 = 'QmSn1wGTpz1';
var jobHash5 = 'QmSn1wGTpz2';
var KEY_JOB_ADDRESS = 1;
const files = [{
  path: 'README.md',
  content: 'text',
}]

var abi = require('ethereumjs-abi')
var BN = require('bignumber.js')

function formatValue(value) {
  if (typeof (value) === 'number' || BN.isBigNumber(value)) {
    return value.toString();
  } else {
    return value;
  }
}

function encodeCall(name, args = [], rawValues = []) {
  const values = rawValues.map(formatValue)
  const methodId = abi.methodID(name, args).toString('hex');
  const params = abi.rawEncode(args, values).toString('hex');
  return '0x' + methodId + params;
}

var proxyAddressJob = '';
var proxyAddressBid = '';
var proxyAddressPayment = '';
var proxyAddressVoting = '';
var proxyAddressPoll = '';
var proxyAddressRating = '';
var proxyAddressDispute = '';
var proxyAddressParams = '';
var bboAddress = '';
var storageAddress = '';
var jobID_A;
var jobID_B;

contract('Voting Test', async (accounts) => {
  
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
    let ratingInstance = await BBRating.new({
      from: accounts[0]
    });
    let votingRewardInstance = await BBDispute.new({
      from: accounts[0]
    });

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


    const l7 = await proxyFact.createProxy(accounts[8], ratingInstance.address, {
      from: accounts[0]
    });
    proxyAddressRating = l7.logs.find(l => l.event === 'ProxyCreated').args.proxy


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
    await storage.addAdmin(proxyAddressRating, true, {
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
    await bbo.transfer(accounts[5], 900e18, {
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

    let rating = await BBRating.at(proxyAddressRating);
    await rating.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await rating.setStorage(storage.address, {
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

    await bid.setPaymentContract(proxyAddressPayment, {
      from: accounts[0]
    });

  });

  var jobIDA;
  var jobIDB;
  var jobIDC;
  var jobIDD;

  it("[Fail] start voting poll without dispute", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var estimatedTime = 3 * 24 * 3600; // 3 days
    //Create Job
    let jobLog = await job.createJob(jobHash4 + 'd', expiredTime, estimatedTime, 500e18, 'banner', {
      from: userA
    });
    jobIDA = jobLog.logs.find(l => l.event === 'JobCreated').args.jobID

    let l = await job.createJob(jobHash4 + 'done', expiredTime, estimatedTime, 500e18, 'banner', {
      from: userA
    });
    jobIDB = l.logs.find(l => l.event === 'JobCreated').args.jobID;
    l = await job.createJob(jobHash4 + 'yes', expiredTime, estimatedTime, 500e18, 'banner', {
      from: userA
    });
    jobIDC = l.logs.find(l => l.event === 'JobCreated').args.jobID;
    //Bid Job
    var userB = accounts[2];
    var userC = accounts[3];

    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 3 * 24 * 3600; // 3 days
    await bid.createBid(jobIDA, 400e18, timeDone, {
      from: userB
    });
    await bid.createBid(jobIDB, 400e18, timeDone, {
      from: userB
    });
    await bid.createBid(jobIDC, 400e18, timeDone, {
      from: userC
    });

    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });
    await bid.acceptBid(jobIDA, userB, {
      from: userA
    });
    await bid.acceptBid(jobIDB, userB, {
      from: userA
    });
    await bid.acceptBid(jobIDC, userC, {
      from: userA
    });

    await job.startJob(jobIDA, {
      from: userB
    });
    await job.startJob(jobIDB, {
      from: userB
    });
    await job.startJob(jobIDC, {
      from: userC
    });
    await job.finishJob(jobIDA, {
      from: userB
    });
    await job.finishJob(jobIDB, {
      from: userB
    });
    await job.finishJob(jobIDC, {
      from: userC
    });

    //Create poll 
    try {
      let voting = await BBDispute.at(proxyAddressDispute);
      let proofHash = 'proofHashc';
      let l = await voting.startPoll(jobIDA, proofHash, {
        from: userB
      });

      console.log('[Fail] start voting poll without dispute OK');

      return false;

    } catch (e) {

      return true;

    }

  });


  it("start other job for dispute voting", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var estimatedTime = 3 * 24 * 3600; // 3 days

    let jobLog = await job.createJob(jobHash4, expiredTime, estimatedTime, 500e18, 'banner', {
      from: userA
    });
    jobIDD = jobLog.logs.find(l => l.event === 'JobCreated').args.jobID

    //console.log(JSON.stringify(xxx.logs));
    var userB = accounts[2];
    let bid = await BBFreelancerBid.at(proxyAddressBid);

    var timeDone = 3 * 24 * 3600; // 3 days
    await bid.createBid(jobIDD, 400e18, timeDone, {
      from: userB
    });
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });
    await bid.acceptBid(jobIDD, userB, {
      from: userA
    });

    await job.startJob(jobIDD, {
      from: userB
    });
    await job.finishJob(jobIDD, {
      from: userB
    });
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    
    let ll = await payment.rejectPayment(jobIDD, 1, {
      from: userA
    });
    await payment.acceptPayment(jobIDB, {
      from: userA
    });
    await payment.acceptPayment(jobIDC, {
      from: userA
    });

    const jobIDx = ll.logs.find(l => l.event === 'PaymentRejected').args.jobID

    assert.equal(JSON.stringify(jobIDx), JSON.stringify(jobIDD));

  });
  it("set params", async () => {
    try {
    let params = await BBParams.at(proxyAddressParams);
    await params.addAdmin(accounts[0], true,{
      from: accounts[0]
    });
    await params.setVotingParams(100e18, 1000000e18, 100e18, 24 * 60 * 60, 24 * 60 * 60,
      24 * 60 * 60, 10e18, {
        from: accounts[0]
      });
    await params.addRelatedAddress(KEY_JOB_ADDRESS, proxyAddressJob, {
        from: accounts[0]
      });
    } catch(e) {
      console.log('Loi set params');
    }
   
    return true;
  });


  it("[Fail] set params MinVotes > MaxVotes", async () => {
    let params = await BBParams.at(proxyAddressParams);
    try {
      await params.setVotingParams(100e18, 10e18, 100e18, 24 * 60 * 60, 24 * 60 * 60,
        24 * 60 * 60, 10e18, {
          from: accounts[0]
        });

      return false;

    } catch (e) {

      return true;
    }

  });
  it("[Fail] UserC start poll", async () => {
    let voting = await BBDispute.at(proxyAddressDispute);
    let proofHash = 'proofHash';
    var userB = accounts[3];
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(voting.address, 0, {
      from: userB
    });
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userB
    });
    try {
      await voting.startPoll(jobIDD, proofHash, {
        from: userB
      });

      return false;
    } catch (e) {


      return true;
    }

  });

  it("start poll", async () => {
    let voting = await BBDispute.at(proxyAddressDispute);
    let proofHash = 'proofHash';
    var userB = accounts[2];
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(voting.address, 0, {
      from: userB
    });
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userB
    });
    let l = await voting.startPoll(jobIDD, proofHash, {
      from: userB
    });
    const jobHashRs = l.logs.find(l => l.event === 'PollStarted').args.jobID
    assert.equal(JSON.stringify(jobHashRs), JSON.stringify(jobIDD));
  });

  it("against poll", async () => {
    let voting = await BBDispute.at(proxyAddressDispute);
    let proofHash = 'proofHashAgainst';
    var userA = accounts[0];
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(voting.address, 0, {
      from: userA
    });
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userA
    });
    let l = await voting.againstPoll(jobIDD, proofHash, {
      from: userA
    });
  
    const jobHashRs = l.logs.find(l => l.event === 'PollAgainsted').args.jobID
    assert.equal(JSON.stringify(jobHashRs), JSON.stringify(jobIDD));
  });
  

  it("[Fail] Owner against poll", async () => {
    let voting = await BBDispute.at(proxyAddressDispute);
    let proofHash = 'proofHashAgainst';
    var userA = accounts[2];
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(voting.address, 0, {
      from: userA
    });
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userA
    });
    try {
      let l = await voting.againstPoll(jobIDD, proofHash, {
        from: userA
      });
      console.log('[Fail] Owner against poll');
      return false;

    } catch (e) {


      return true;
    }

  });

  it("[Fail] against poll with invalid jobHash", async () => {
    let voting = await BBDispute.at(proxyAddressDispute);
    let proofHash = 'proofHashAgainst';
    var userA = accounts[0];
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(voting.address, 0, {
      from: userA
    });
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userA
    });
    try {
      let l = await voting.againstPoll(jobIDA, proofHash, {
        from: userA
      });

      console.log('[Fail] against poll with invalid jobHash');

      return false;

    } catch (e) {


      return true;
    }

  });

  it("reqest voting rights", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[1];
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(voting.address, 0, {
      from: userC
    });
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userC
    });
    let l = await voting.requestVotingRights(200e18, {
      from: userC
    });
    const jobHashRs = l.logs.find(l => l.event === 'VotingRightsGranted').args.voter
    assert.equal(userC, jobHashRs);
  });
  it("fast forward to 24h after start poll", function () {
    var fastForwardTime = 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {


      });
    });
  });
  
  it("[Fail] commit vote without votingRigt", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[3];
    var secretHash = web3.utils.soliditySha3(accounts[2], 123);
    try {
      let l = await voting.commitVote(jobIDD, secretHash, 200e18, {
        from: userC
      });
      console.log('[Fail] commit vote without votingRigt OK');
      return false;
    } catch (e) {

      return true;
    }

  });
  it("commit vote ", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[1];
    var secretHash = web3.utils.soliditySha3(accounts[2], 123);
    let l = await voting.commitVote(jobIDD, secretHash, 200e18, {
      from: userC
    });
    const jobHashRs = l.logs.find(l => l.event === 'VoteCommitted').args.jobID
    assert.equal(JSON.stringify(jobHashRs), JSON.stringify(jobIDD));
  });
  
  it("re-commit vote ", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[1];
    var secretHash = web3.utils.soliditySha3(accounts[2], 123);
    let l = await voting.commitVote(jobIDD, secretHash, 300e18, {
      from: userC
    });
    const jobHashRs = l.logs.find(l => l.event === 'VoteCommitted').args.jobID
    assert.equal(JSON.stringify(jobHashRs), JSON.stringify(jobIDD));
  });
  
  it("fast forward to 24h after commit vote poll", function () {
    var fastForwardTime = 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

  it("[Fail] reveal vote with missing address", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[1];
    try {
      await voting.revealVote(jobIDD, accounts[3], 123, {
        from: userC
      });

      return false;
    } catch (e) {

      return true;
    }

  });

  it("[Fail] reveal vote with missing salt", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[1];
    try {
      await voting.revealVote(jobIDD, accounts[2], 124, {
        from: userC
      });

      return false;
    } catch (e) {

      return true;
    }

  });

 


  it("[Fail] reveal vote with missing voter", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[3];
    try {
      await voting.revealVote(jobIDD, accounts[2], 123, {
        from: userC
      });

      return false;
    } catch (e) {

      return true;
    }

  });

  it("reveal vote ", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[1];
    let l = await voting.revealVote(jobIDD, accounts[2], 123, {
      from: userC
    });
   
    const jobHashRs = l.logs.find(l => l.event === 'VoteRevealed').args.jobID
    assert.equal(JSON.stringify(jobHashRs), JSON.stringify(jobIDD));
  });

  // it("reveal vote  Agian", async () => {
  //   let voting = await BBVoting.at(proxyAddressVoting);
  //   var userC = accounts[1];
  //   let l = await voting.revealVote(jobIDD, accounts[2], 123, {
  //     from: userC
  //   });
   
  //   const jobHashRs = l.logs.find(l => l.event === 'VoteRevealed').args.jobID
  //   assert.equal(JSON.stringify(jobHashRs), JSON.stringify(jobIDD));
  // });
  

  
  var jobIDE;
  it("start other job for dispute voting", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var estimatedTime = 3 * 24 * 3600; // 3 days

    let jobLog = await job.createJob(jobHash5, expiredTime, estimatedTime, 500e18, 'banner', {
      from: userA
    });
    jobIDE = jobLog.logs.find(l => l.event === 'JobCreated').args.jobID

    var userB = accounts[2];
    let bid = await BBFreelancerBid.at(proxyAddressBid);

    var timeDone = 3 * 24 * 3600; // 3 days
    await bid.createBid(jobIDE, 400e18, timeDone, {
      from: userB
    });
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });
    await bid.acceptBid(jobIDE, userB, {
      from: userA
    });
    await job.startJob(jobIDE, {
      from: userB
    });
    await job.finishJob(jobIDE, {
      from: userB
    });
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    
    jobLog = await payment.rejectPayment(jobIDE, 1, {
      from: userA
    });

    let reID = jobLog.logs.find(l => l.event === 'PaymentRejected').args.jobID;

    assert.equal(JSON.stringify(reID) ,JSON.stringify(jobIDE));

  });



  it("start poll for jobIDE", async () => {
    let voting = await BBDispute.at(proxyAddressDispute);
    let proofHash = 'proofHash';
    var userB = accounts[2];
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(voting.address, 0, {
      from: userB
    });
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userB
    });
    let l = await voting.startPoll(jobIDE, proofHash, {
      from: userB
    });
    const jobHashRs = l.logs.find(l => l.event === 'PollStarted').args.jobID
    assert.equal(JSON.stringify(jobHashRs) ,JSON.stringify(jobIDE));
  });

  

  it("against poll for jobIDE", async () => {
    let voting = await BBDispute.at(proxyAddressDispute);
    let proofHash = 'proofHashAgainst';
    var userA = accounts[0];
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(voting.address, 0, {
      from: userA
    });
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userA
    });
    let l = await voting.againstPoll(jobIDE, proofHash, {
      from: userA
    });
    const jobHashRs = l.logs.find(l => l.event === 'PollAgainsted').args.jobID
    assert.equal(JSON.stringify(jobHashRs) ,JSON.stringify(jobIDE));
});
  it("fast forward to 24h after commit vote poll jobHash5", function () {
    var fastForwardTime = 4 * 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });
  it("extend time when no one commit vote", async () => {
    let voting = await BBDispute.at(proxyAddressDispute);

    var userA = accounts[0];
    
    let l = await voting.updatePoll(jobIDE, false, {

      from: userA
    });
    const jobHashRs = l.logs.find(l => l.event === 'PollUpdated').args.jobID
    assert.equal(JSON.stringify(jobHashRs) ,JSON.stringify(jobIDE));
  });
 
  it("white-flag Poll when no one commit vote", async () => {

    let bbo = await BBOTest.at(bboAddress);
    await bbo.transfer(proxyAddressPayment, 100000e18, {
      from: accounts[0]
    });

    let voting = await BBDispute.at(proxyAddressDispute);
    var userA = accounts[0];

    
    let l = await voting.updatePoll(jobIDE, true,{
      from: userA
    });
    const jobHashRs = l.logs.find(l => l.event === 'PollUpdated').args.jobID
    assert.equal(JSON.stringify(jobHashRs) ,JSON.stringify(jobIDE));
  });

    it("Rating B->A 4 Star", async () => {
    var userB = accounts[2];
    var userA = accounts[0];

    let rating = await BBRating.at(proxyAddressRating);
    //console.log(jobIDB);
    let commentHash = 'sfvsjhfvdsj';
    let l = await rating.rate(KEY_JOB_ADDRESS , userA, jobIDB, 4, commentHash, {
      from: userB
    });

    let jj = l.logs.find(l => l.event === 'Rating').args
   //console.log(jobID_A);
   // console.log(JSON.stringify(jj));
   assert(4 ==  jj.star);
  });


  it("Rating C->A 5 star", async () => {
    let rating = await BBRating.at(proxyAddressRating);
    var userC = accounts[3];
    var userA = accounts[0];

    let commentHash = 'sfvsjhfvdsj';
    let l = await rating.rate(KEY_JOB_ADDRESS, userA,jobIDC, 5, commentHash, {
      from: userC
    });
    let jj = l.logs.find(l => l.event === 'Rating').args
    assert(9  ==  jj.totalStar);
    //console.log(JSON.stringify(jj));
  });
  

  it("Rating C->A agian 1 star", async () => {
    let rating = await BBRating.at(proxyAddressRating);
    var userC = accounts[3];
    var userA = accounts[0];
    var userB = accounts[4];
    let commentHash = 'sfvsjhfvdsj';
    let l = await rating.rate(KEY_JOB_ADDRESS, userA,jobIDC, 1, commentHash, {
      from: userC
    });
    let jj = l.logs.find(l => l.event === 'Rating').args
    assert( 5 ==  jj.totalStar);
    //console.log(JSON.stringify(jj));

  });


  it("Rating C->A agian 3 star", async () => {
    let rating = await BBRating.at(proxyAddressRating);
    var userC = accounts[3];
    var userB = accounts[1];
    var userA = accounts[0];

    let commentHash = 'sfvsjhfvdsj';
    let l = await rating.rate(KEY_JOB_ADDRESS, userA,jobIDC, 3, commentHash, {
      from: userC
    });
    let jj = l.logs.find(l => l.event === 'Rating').args
     assert( 7 ==  jj.totalStar);
    //console.log(JSON.stringify(jj));

  });



  it("[Fail] not freelancer Rating ", async () => {
    let rating = await BBRating.at(proxyAddressRating);
    var userB = accounts[5];
    var userA = accounts[0];

    let commentHash = 'sfvsjhfvdsj';
    try {
      let l = await rating.rate(KEY_JOB_ADDRESS ,userA,jobIDC, 1, commentHash, {
        from: userB
      });
      console.log('[Fail] not freelancer Rating  OK');
      return false;
    } catch (e) {
      return true;
    }
  });

  


  it("[Fail] Rating wrong rateTo adress ", async () => {
    let rating = await BBRating.at(proxyAddressRating);
    var userB = accounts[4];
    var userA = accounts[0];

    let commentHash = 'sfvsjhfvdsj';
    try {
      let l = await rating.rate(KEY_JOB_ADDRESS ,userB,jobIDC, 1, commentHash, {
        from: userB
      });
      console.log('[Fail] Rating wrong rateTo adress');
      return false;
    } catch (e) {
      return true;
    }
  });

  it("[Fail] Rating themself ", async () => {
    let rating = await BBRating.at(proxyAddressRating);
    var userB = accounts[2];
    var userA = accounts[0];

    let commentHash = 'sfvsjhfvdsj';
    try {
      let l = await rating.rate(KEY_JOB_ADDRESS ,userB,jobIDC, 1, commentHash, {
        from: userB
      });
      console.log('[Fail] Rating themself  OK');
      return false;
    } catch (e) {
      return true;
    }
  });

  
  it("Rating A->B", async () => {
    let rating = await BBRating.at(proxyAddressRating);
    var userA = accounts[0];
    var userB = accounts[2];
    let commentHash = 'sfvsjhfvdsj';
    let l = await rating.rate(KEY_JOB_ADDRESS, userB,jobIDB, 3, commentHash, {
      from: userA
    });
    let jj = l.logs.find(l => l.event === 'Rating').args
    //console.log(jj);
    assert( 1 ==  jj.totalUser);
   // console.log(JSON.stringify(jj));

  });



  it("[Fail] Rating without interact Job", async () => {
    let rating = await BBRating.at(proxyAddressRating);
    var userA = accounts[0];
    var userB = accounts[1];
    let commentHash = 'sfvsjdhfvdsj';
    try {
      let l = await rating.rate(KEY_JOB_ADDRESS, userA, jobIDC, 4, commentHash, {
        from: userB
      });
      let jj = l.logs.find(l => l.event === 'Rating').args
      console.log(JSON.stringify(jj));
      return false;
    } catch (e) {
      return true;
    }
  });

});