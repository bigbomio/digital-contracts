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
var proxyAddressParams = '';
var bboAddress = '';
var storageAddress = '';

contract('Voting Test 3', async (accounts) => { 
  
  it("initialize contract 3", async () => {

    // var filesrs = await ipfs.files.add(files);
    // //console.log('filesrs', filesrs);

    // jobHash = filesrs[0].hash;
    erc20 = await BBOTest.new({
      from: accounts[0]
    });
    bboAddress = erc20.address;
    //console.log('jobHash', jobHash);
    // create storage
    //console.log('bboAddress', bboAddress);
    let storage = await BBStorage.new({
      from: accounts[0]
    });
    //console.log('storage address', storage.address);
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
    //console.log('proxyAddressJob', proxyAddressJob)

    const l2 = await proxyFact.createProxy(accounts[8], bidInstance.address, {
      from: accounts[0]
    });
    proxyAddressBid = l2.logs.find(l => l.event === 'ProxyCreated').args.proxy
    //console.log('proxyAddressBid', proxyAddressBid)

    const l3 = await proxyFact.createProxy(accounts[8], paymentInstance.address, {
      from: accounts[0]
    });
    proxyAddressPayment = l3.logs.find(l => l.event === 'ProxyCreated').args.proxy
    //console.log('proxyAddressPayment', proxyAddressPayment)

    const l4 = await proxyFact.createProxy(accounts[8], votingInstance.address, {
      from: accounts[0]
    });
    proxyAddressVoting = l4.logs.find(l => l.event === 'ProxyCreated').args.proxy
    //console.log('proxyAddressVoting', proxyAddressVoting)

    const l5 = await proxyFact.createProxy(accounts[8], paramsInstance.address, {
      from: accounts[0]
    });
    proxyAddressParams = l5.logs.find(l => l.event === 'ProxyCreated').args.proxy
    //console.log('proxyAddressParams', proxyAddressParams)

    const l6 = await proxyFact.createProxy(accounts[8], votingRewardInstance.address, {
      from: accounts[0]
    });
    proxyAddressPoll = l6.logs.find(l => l.event === 'ProxyCreated').args.proxy
    //console.log('proxyAddressPoll', proxyAddressPoll)


    // set admin to storage
    await storage.addAdmin(proxyAddressJob,  true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressBid,  true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressPayment, true,  {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressVoting,  true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressPoll,  true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressParams, true,  {
      from: accounts[0]
    });

    await storage.addAdmin(accounts[7],  true, {
      from: accounts[0]
    });

    //console.log('done storage')
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
    await bbo.transfer(accounts[4], 900e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[5], 900e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[6], 900e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[7], 9000e18, {
      from: accounts[0]
    });
    //console.log('bbo: ', bbo.address);

    

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


    await bbo.transfer(payment.address, 9000e18, {
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
    await voting.setBBOReward(accounts[7], {
      from: accounts[0]
    });

    await bbo.approve(voting.address, 0, {
      from: accounts[7]
    });
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: accounts[7]
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

    let votingReward = await BBDispute.at(proxyAddressPoll);
    await votingReward.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await votingReward.setStorage(storage.address, {
      from: accounts[0]
    });
    await votingReward.setBBO(bboAddress, {
      from: accounts[0]
    });

    await votingReward.setPayment(proxyAddressPayment,{
      from: accounts[0]
    });

    await bid.setPaymentContract(proxyAddressPayment, {
      from: accounts[0]
    });

  });

  it("set params", async () => {
    let params = await BBParams.at(proxyAddressParams);
    await params.addAdmin(accounts[0], true);
    await params.setVotingParams(100e18, 1000000e18, 60, 300e18, 24 * 60 * 60, 24 * 60 * 60,
      24 * 60 * 60, 10e18, 100e18, {
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

 
  it("create job with dispute 3", async () => {
  
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[1];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var estimatedTime = 3 * 24 * 3600; // 3 days
    await job.createJob(jobHash4 + 'kk', expiredTime, estimatedTime, 500e18, 'banner', {
      from: userA
    });
    expiredTime = parseInt(Date.now() / 1000) + 90 * 24 * 3600;
    await job.createJob(jobHash5 + 'kk', expiredTime, estimatedTime, 500e18, 'banner', {
      from: userA
    });

    await job.createJob(jobHash6 + 'kk', expiredTime, estimatedTime, 500e18, 'banner', {
      from: userA
    });

    let bbo = await BBOTest.at(bboAddress);
    let xxx  = await bbo.balanceOf(userA, {
      from: userA
    });

    //console.log('bbo balance userA Beffore : ',  xxx );
    
    var userB = accounts[3];


    let xxxyn  = await bbo.balanceOf(userA, {
      from: userA
    });
    let xxxzn  = await bbo.balanceOf(userB, {
      from: userB
    });

    console.log('bbo balance Job Owner Affter Bid: ',  xxxyn );
    console.log('bbo balance Freelancer Affter Bid: ',  xxxzn );


    let bid = await BBFreelancerBid.at(proxyAddressBid);

    var timeDone = 3 * 24 * 3600; // 3 days
    await bid.createBid(jobHash4 + 'kk', 500e18, timeDone, {
      from: userB
    });
    
    
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });
    await bid.acceptBid(jobHash4 + 'kk', userB, {
      from: userA
    });
   

    await job.startJob(jobHash4 + 'kk', {
      from: userB
    });
    await job.finishJob(jobHash4 + 'kk', {
      from: userB
    });
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    await payment.rejectPayment(jobHash4 + 'kk', 1,{
      from: userA
    });

    

    let xxxy  = await bbo.balanceOf(userA, {
      from: userA
    });
    let xxxz  = await bbo.balanceOf(userB, {
      from: userB
    });

    console.log('bbo balance Job Owner Affter Dispute: ',  xxxy );
    console.log('bbo balance Freelancer Affter Dispute: ',  xxxz );


    let voting = await BBDispute.at(proxyAddressPoll);
    let proofHash = 'proofHashxxkkpodid';
    await bbo.approve(voting.address, 0, {
      from: userB
    });
   
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userB
    });
    
    await voting.startPoll(jobHash4 + 'kk', proofHash, {
      from: userB
    });

    //User A AgainPoll

    await bbo.approve(voting.address, 0, {
      from: userA
    });
   
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userA
    });
    

    await voting.againstPoll(jobHash4 + 'kk', proofHash+'okman', {
      from: userA
    });

   

    let xxxzk  = await bbo.balanceOf(userB, {
      from: userB
    });

    //console.log('bbo balance userB Affter : ',  xxxzk );

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

    await votingRight.requestVotingRights(200e18, {
      from: userE
    });

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
   
    await voting.commitVote(jobHash4 + 'kk', web3.utils.soliditySha3(accounts[1], 123), 200e18, {
      from: userC
    });

    await voting.commitVote(jobHash4 + 'kk', web3.utils.soliditySha3(accounts[3], 124), 500e18, {
      from: userD
    });
    await voting.commitVote(jobHash4 + 'kk', web3.utils.soliditySha3(accounts[3], 124), 500e18, {
      from: userE
    });

    let btc = await voting.checkBalance({from: userD});
    console.log('btc :', btc);
   
   
  });

  it("fast forward to  1 after start poll 3333", function () {
    var fastForwardTime = 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

  it("[Fail] not votter reveal vote 333", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userE = accounts[6];

    try {
    await voting.revealVote(jobHash4 + 'kk', accounts[1], 123, {
      from: userE
    });
    console.log('User E can revealVote');
    return false;
    } catch(e) {
      console.log('User E can not revealVote');
      return true;
    }

  
    
  });

  it("[Fail] reveal vote with wrong choose 333", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[4];

    try {
    await voting.revealVote(jobHash4 + 'kk', accounts[2], 123, {
      from: userC
    });
    console.log('revealVote OK');
    return false;
    } catch(e) {
      console.log('revealVote FAIL');
      return true;
    }

  
    
  });



  it("reveal vote 333", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[4];
    var userD = accounts[5];
    var userE = accounts[6];

    let l = await voting.revealVote(jobHash4 + 'kk', accounts[1], 123, {
      from: userC
    });

    //console.log('jobOwner : ',accounts[1]);
    //console.log('freelancer : ',accounts[3]);


    const a = l.logs.find(l => l.event === 'VoteRevealed').args
    //console.log(a);


    let l2 = await voting.revealVote(jobHash4 + 'kk', accounts[3], 124, {
      from: userD
    });
    voting.revealVote(jobHash4 + 'kk', accounts[3], 124, {
      from: userE
    });
    const aa = l2.logs.find(l2 => l2.event === 'VoteRevealed').args
    //console.log(aa);

    
  });



  it("checkHash", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[4];
    

    let ll = await voting.checkHash(jobHash4 + 'kk', accounts[1], 123, {
      from: userC
    });

    console.log(ll);

    
  });

  //return;
  it("fast forward to 24h * 10 after start poll 3333", function () {
    var fastForwardTime = 10 * 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

 

  it("finalizePoll 3333 ", async () => {
    try {
     
      var userA = accounts[1];
      var userB = accounts[3];

      let votingRight = await BBDispute.at(proxyAddressPoll);

      let info_ = await votingRight.getPoll(jobHash4+'kk', {
        from: userB
      });
      console.log(JSON.stringify( info_ ));
    
    
    //claimReward
    let l =  await votingRight.finalizePoll(jobHash4+'kk', {
      from: userB
    });
    const a = l.logs.find(l => l.event === 'PollFinalized').args
    //console.log(a);
    let bbo = await BBOTest.at(bboAddress);
    
    let xxxy  = await bbo.balanceOf(userA, {
      from: userA
    });
    let xxxz  = await bbo.balanceOf(userB, {
      from: userB
    });

    console.log('bbo balance Job Owner Affter finalizePoll: ',  xxxy );
    console.log('bbo balance Freelancer Affter finalizePoll: ',  xxxz );

    return true;
  } catch(e) {
    console.log('LOIiiiiiiiiiiiiiiiiiiiii');
    //console.log(e);
    return false;
  }
    
  });

  it("claimReward 3333 ", async () => {
    try {
     
      var userC = accounts[4];
      var userD = accounts[5];
      var userE = accounts[6];

      let bbo = await BBOTest.at(bboAddress);

      let xxxyc  = await bbo.balanceOf(userC, {
        from: userC
      });
      let xxxzc  = await bbo.balanceOf(userD, {
        from: userD
      });
  
      let xxxzcx  = await bbo.balanceOf(userE, {
        from: userE
      });
  
      console.log('bbo balance UserC Before finalizePoll: ',  xxxyc );
      console.log('bbo balance UserD Before finalizePoll: ',  xxxzc );
      console.log('bbo balance UserE Before finalizePoll: ',  xxxzcx );


      let votingRight = await BBVoting.at(proxyAddressVoting);

      await votingRight.claimReward(jobHash4+'kk', {
        from: userC
      });
      await votingRight.claimReward(jobHash4+'kk', {
        from: userD
      });
      await votingRight.claimReward(jobHash4+'kk', {
        from: userE
      });
     
    
    let xxxy  = await bbo.balanceOf(userC, {
      from: userC
    });
    let xxxz  = await bbo.balanceOf(userD, {
      from: userD
    });
    let xxxo  = await bbo.balanceOf(userE, {
      from: userD
    });

    console.log('bbo balance UserC Affter finalizePoll: ',  xxxy );
    console.log('bbo balance UserD Affter finalizePoll: ',  xxxz );
    console.log('bbo balance UserE Affter finalizePoll: ',  xxxo );

    return true;
  } catch(e) {
    console.log('LOi claimReward');
    console.log(e);
    return false;
  }
    
  });

  it("[Fail] claimReward  Again 3333 ", async () => {
    try {
     
      var userC = accounts[4];
      


      let votingRight = await BBVoting.at(proxyAddressVoting);

      await votingRight.claimReward(jobHash4+'kk', {
        from: userC
      });
     ;
    console.log('claimReward  Again OK');

    return false;
  } catch(e) {
    console.log('claimReward  Again FAIL');

    return true;
  }
    
  });

  it("withdrawVotingRights 3333 ", async () => {
    try {
     
      var userC = accounts[4];
      var userD = accounts[5];
      var userE = accounts[6];

      let bbo = await BBOTest.at(bboAddress);

     
      let votingRight = await BBVoting.at(proxyAddressVoting);

      await votingRight.withdrawVotingRights(200e18, {
        from: userC
      });
     
     
    
    let xxxy  = await bbo.balanceOf(userC, {
      from: userC
    });
   

    console.log('bbo balance UserC Affter withdrawVotingRights: ',  xxxy );
    

    return true;
  } catch(e) {
    console.log('LOi withdrawVotingRights');
    console.log(e);
    return false;
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
    await bid.createBid(jobHash4 + 'kk', 500e18, timeDone, {
      from: userB
    });

    
    
  
    await bid.acceptBid(jobHash4 + 'kk', userB, {
      from: userA
    });
   


    await job.startJob(jobHash4 + 'kk', {
      from: userB
    });
    await job.finishJob(jobHash4 + 'kk', {
      from: userB
    });
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    await payment.rejectPayment(jobHash4 + 'kk', 1,{
      from: userA
    });

    

    let voting = await BBDispute.at(proxyAddressPoll);
    let proofHash = 'proofHashxxkkpodiddd';
    await bbo.approve(voting.address, 0, {
      from: userB
    });
   
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userB
    });
    
    await voting.startPoll(jobHash4 + 'kk', proofHash, {
      from: userB
    });

    //User A AgainPoll

    await bbo.approve(voting.address, 0, {
      from: userA
    });
   
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userA
    });
    

    await voting.againstPoll(jobHash4 + 'kk', proofHash+'okmjjan', {
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

    await votingRight.requestVotingRights(200e18, {
      from: userE
    });
    
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
   
    await voting.commitVote(jobHash4 + 'kk', web3.utils.soliditySha3(accounts[1], 123), 100e18, {
      from: userC
    });

    await voting.commitVote(jobHash4 + 'kk', web3.utils.soliditySha3(accounts[1], 124), 100e18, {
      from: userD
    });
    await voting.commitVote(jobHash4 + 'kk', web3.utils.soliditySha3(accounts[1], 124), 100e18, {
      from: userE
    });
   
  });

  it("fast forward to  1 after start poll 3333", function () {
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

    await voting.revealVote(jobHash4 + 'kk', accounts[1], 123, {
      from: userC
    });
    await voting.revealVote(jobHash4 + 'kk', accounts[1], 124, {
      from: userD
    });
    await voting.revealVote(jobHash4 + 'kk', accounts[1], 124, {
      from: userE
    });
 
    
  });

  it("fast forward to 24h * 10 after start poll 3333", function () {
    var fastForwardTime = 10 * 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

  it("finalizePoll JOB Owner Win ", async () => {
    try {
      let bbo = await BBOTest.at(bboAddress);
      var userA = accounts[1];
      var userB = accounts[3];

      let xxxyc  = await bbo.balanceOf(userA, {
        from: userA
      });
      let xxxzc  = await bbo.balanceOf(userB, {
        from: userB
      });
  
      console.log('bbo balance Job Owner Before finalizePoll: ',  xxxyc );
      console.log('bbo balance Freelancer Before finalizePoll: ',  xxxzc );

      let votingRight = await BBDispute.at(proxyAddressPoll);

      let info_ = await votingRight.getPoll(jobHash4+'kk', {
        from: userB
      });
      console.log(JSON.stringify( info_ ));
    
    
    //claimReward
    let l =  await votingRight.finalizePoll(jobHash4+'kk', {
      from: userB
    });
    const a = l.logs.find(l => l.event === 'PollFinalized').args
    //console.log(a);
    
    
    let xxxy  = await bbo.balanceOf(userA, {
      from: userA
    });
    let xxxz  = await bbo.balanceOf(userB, {
      from: userB
    });

    console.log('bbo balance Job Owner Affter finalizePoll: ',  xxxy );
    console.log('bbo balance Freelancer Affter finalizePoll: ',  xxxz );

    return true;
  } catch(e) {
    console.log('LOI finalizePoll JOB Owner Win');
    console.log(e);
    return false;
  }
    
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
    await bid.createBid(jobHash4 + 'kk', 500e18, timeDone, {
      from: userB
    });

    
    
  
    await bid.acceptBid(jobHash4 + 'kk', userB, {
      from: userA
    });
   


    await job.startJob(jobHash4 + 'kk', {
      from: userB
    });
    await job.finishJob(jobHash4 + 'kk', {
      from: userB
    });
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    await payment.rejectPayment(jobHash4 + 'kk', 1,{
      from: userA
    });

    

    let voting = await BBDispute.at(proxyAddressPoll);
    let proofHash = 'proofHashxxkkpodiddd';
    await bbo.approve(voting.address, 0, {
      from: userB
    });
   
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userB
    });
    
    await voting.startPoll(jobHash4 + 'kk', proofHash, {
      from: userB
    });

    //User A AgainPoll

    await bbo.approve(voting.address, 0, {
      from: userA
    });
   
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userA
    });
    

    await voting.againstPoll(jobHash4 + 'kk', proofHash+'okmjjan', {
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

    await votingRight.requestVotingRights(200e18, {
      from: userE
    });
    
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
    var userE = accounts[6];
   
    await voting.commitVote(jobHash4 + 'kk', web3.utils.soliditySha3(accounts[3], 123), 100e18, {
      from: userC
    });

    await voting.commitVote(jobHash4 + 'kk', web3.utils.soliditySha3(accounts[1], 124), 100e18, {
      from: userD
    });
    
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
    await voting.revealVote(jobHash4 + 'kk', accounts[3], 123, {
      from: userC
    }); 
    return false;

  } catch(e) {
    return true;
  }
    
  });

  it("reveal vote Nobody win", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[4];
    var userD = accounts[5];
    var userE = accounts[6];

    await voting.revealVote(jobHash4 + 'kk', accounts[3], 123, {
      from: userC
    });
    await voting.revealVote(jobHash4 + 'kk', accounts[1], 124, {
      from: userD
    });
   
 
    
  });

  it("fast forward to 24h * 10 after start poll 3333", function () {
    var fastForwardTime = 10 * 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

  it("finalizePoll Nobody win", async () => {
    try {
      let bbo = await BBOTest.at(bboAddress);
      var userA = accounts[1];
      var userB = accounts[3];

      let xxxyc  = await bbo.balanceOf(userA, {
        from: userA
      });
      let xxxzc  = await bbo.balanceOf(userB, {
        from: userB
      });
  
      console.log('bbo balance Job Owner Before finalizePoll: ',  xxxyc );
      console.log('bbo balance Freelancer Before finalizePoll: ',  xxxzc );

      let votingRight = await BBDispute.at(proxyAddressPoll);

      let info_ = await votingRight.getPoll(jobHash4+'kk', {
        from: userB
      });
      console.log(JSON.stringify( info_ ));
    
    
    //claimReward
    let l =  await votingRight.finalizePoll(jobHash4+'kk', {
      from: userB
    });
    const a = l.logs.find(l => l.event === 'PollFinalized').args
    //console.log(a);
    
    
    let xxxy  = await bbo.balanceOf(userA, {
      from: userA
    });
    let xxxz  = await bbo.balanceOf(userB, {
      from: userB
    });

    console.log('bbo balance Job Owner Affter finalizePoll: ',  xxxy );
    console.log('bbo balance Freelancer Affter finalizePoll: ',  xxxz );

    return true;
  } catch(e) {
    console.log('LOI finalizePoll Nobody win');
    console.log(e);
    return false;
  }
    
  });

  it("withdrawTokens", async () => {
    var userA = accounts[0];
    let bbo = await BBOTest.at(bboAddress);

    console.log('bbo.address ', bbo.address);

    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    var jobLog = await payment.withdrawTokens(bbo.address, {
      from: userA
    });
    console.log(jobLog);

  });

  it("[Fail] reveal vote Nobody win affter finalizePoll", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[4];

    try {
    await voting.revealVote(jobHash4 + 'kk', accounts[3], 123, {
      from: userC
    }); 
    return false;

  } catch(e) {
    return true;
  }
    
  });

});
