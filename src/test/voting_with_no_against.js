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
var jobHash4 = 'QmSn1wGTpz1';

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

contract('Voting Test 2', async (accounts) => {

  it("initialize contract 2", async () => {

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
    proxyAddressPoll = l6.logs.find(l => l.event === 'ProxyCreated').args.proxy
    


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
    await storage.addAdmin(proxyAddressPoll, true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressParams, true, {
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

    await votingReward.setPayment(proxyAddressPayment, {
      from: accounts[0]
    });

    await bid.setPaymentContract(proxyAddressPayment, {
      from: accounts[0]
    });

  });



  it("set params", async () => {
    let params = await BBParams.at(proxyAddressParams);
    await params.addAdmin(accounts[0], true);
    await params.setVotingParams(100e18, 1000000e18, 300e18, 24 * 60 * 60, 24 * 60 * 60,
      24 * 60 * 60, 10e18,  {
        from: accounts[0]
      });
    return true;
  });


  it("get params", async () => {
    let params = await BBParams.at(proxyAddressParams);
    let re = await params.getVotingParams({
      from: accounts[0]
    });
    
  });

  it("set setFreelancerParams", async () => {
    let params = await BBParams.at(proxyAddressParams);
    await params.setFreelancerParams(24 * 60 * 60,24 * 60 * 60,  {
      from: accounts[0]
    });
    return true;
  });

  it("get getFreelancerParams", async () => {
    let params = await BBParams.at(proxyAddressParams);
    let re = await params.getFreelancerParams({
      from: accounts[0]
    });
    
  });


  it("create job with dispute 2", async () => {

    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var userB = accounts[2];

    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var estimatedTime = 3 * 24 * 3600; // 3 days

    await job.createJob(jobHash4 + 'kk', expiredTime, estimatedTime, 500e18, 'banner', {
      from: userA
    });
    
    let bbo = await BBOTest.at(bboAddress);
    let xxx = await bbo.balanceOf(userA, {
      from: userA
    });

    let bl = await getBalance(bbo, userB);
    

    let bbl = await getBalance(bbo, userA);
    

    
    var userB = accounts[2];
    let bid = await BBFreelancerBid.at(proxyAddressBid);

    var timeDone = 3 * 24 * 3600; // 3 days
    await bid.createBid(jobHash4 + 'kk', 400e18, timeDone, {
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

    let xxxy = await bbo.balanceOf(userA, {
      from: userA
    });
    let xxxz = await bbo.balanceOf(userB, {
      from: userB
    });


    let voting = await BBDispute.at(proxyAddressPoll);
    let proofHash = 'proofHashxxkk';
    await bbo.approve(voting.address, 0, {
      from: userB
    });

    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userB
    });

    let l = await voting.startPoll(jobHash4 + 'kk', proofHash, {
      from: userB
    });

    const jobHashRs = l.logs.find(l => l.event === 'PollStarted').args.indexJobHash
    assert.equal(web3.utils.sha3(jobHash4 + 'kk'), jobHashRs);
    // let jh = jobHash4 + 'kk';
    // var myContract = await new web3.eth.Contract(voting.abi, voting.address, {
    //   from: userA, // default from address
    //   gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
    // });

    

    // try {
    //   await myContract.getPastEvents('PollStarted', {
    //     filter: {
    //       owner: userB,
    //       jobHash: jh
    //     }, // filter by owner, category
    //     fromBlock: 0, // should use recent number
    //     toBlock: 'latest'
    //   }, function (error, events) {
    //     //TODO
    //     if (error) {
          
    //       //console.s.log(error);
    //     }
        
    //   }).then(function (events) {
        
    //   });

    // } catch (e) {
      
    // }

   
  });



  it("fast forward to 24h * 1 after start poll", function () {
    var fastForwardTime = 1 * 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });


  it("[Fail] commit vote without agianst", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    var userC = accounts[4];
    var userD = accounts[5];    
    
   try {
    await voting.commitVote(jobHash4 + 'kk', web3.utils.soliditySha3(accounts[1], 123), 200e18, {
      from: userC
    });

    await voting.commitVote(jobHash4 + 'kk', web3.utils.soliditySha3(accounts[3], 124), 500e18, {
      from: userD
    });

    return false;
  } catch(e) {
  
    return true;
  }
   
  });


  it("fast forward to 24h * 10 after start poll", function () {
    var fastForwardTime = 10 * 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

  async function getBalance(token, address) {
    return await token.balanceOf(address, {
      from: accounts[0]
    });
  }

  it("finalizePoll", async () => {
  
      var userB = accounts[2];

      let votingRight = await BBDispute.at(proxyAddressPoll);

      let info_ = await votingRight.getPoll(jobHash4 + 'kk', {
        from: userB
      });

          
      let bbo = await BBOTest.at(bboAddress);

      let bl = await getBalance(bbo, userB);

      let isAgian = await votingRight.isAgaintsPoll(jobHash4 + 'kk', {
        from: userB
      });

     
      //claimReward
      await votingRight.finalizePoll(jobHash4 + 'kk', {
        from: userB
      });
      let xxx = await bbo.balanceOf(userB, {
        from: userB
      });

      assert(bl.c[0] < xxx.c[0]);

  });

  it("[Fail] UserA call finalizePoll agian", async () => {
    try {

      var userB = accounts[2];

      let votingRight = await BBDispute.at(proxyAddressPoll);


      await votingRight.finalizePoll(jobHash4 + 'kk', {
        from: userB
      });

      return false;
    } catch (e) {
      
      
      return true;
    }

  });

});