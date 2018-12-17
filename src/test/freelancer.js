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


var contractAddr = '';
var jobHash = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr';
var jobHashWilcancel = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr2';
var jobHash3 = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr3';
var jobHash4 = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr4';

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
var bboAddress = '';
var storageAddress = '';
contract('BBFreelancer Test', async (accounts) => {

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
    await storage.addAdmin(accounts[7], true, {
      from: accounts[0]
    });


    let bbo = await BBOTest.at(bboAddress);
    await bbo.transfer(accounts[1], 1000e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[2], 1000e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[3], 1000e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[4], 1000e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[5], 1000e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[6], 1000e18, {
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

    await bid.setPaymentContract(proxyAddressPayment, {
      from: accounts[0]
    });
    await job.setPaymentContract(proxyAddressPayment, {
      from: accounts[0]
    });

    await payment.addToken(bboAddress, true,{ from: accounts[0]});
    await payment.addToken('0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeebb0', true,{ from: accounts[0]});

  });

  var jobID = 0;
  var jobIDM = 0;
  var jobIR = 0;
  var jobHashX = 'sadvsadjhkakaka';
  it("create new job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var userB = accounts[1];

    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600;
    //days

    var jobLogtop = await job.createJob(jobHash, expiredTime, timeBid, 500e18, 'top', bboAddress, {
      from: userA
    });
    jobID =  jobLogtop.logs.find(l => l.event === 'JobCreated').args.jobID

    jobLogtop = await job.createJob(jobHashX, expiredTime, timeBid, 500e18, 'top', bboAddress, {
      from: userA
    });
    jobIDM = jobLogtop.logs.find(l => l.event === 'JobCreated').args.jobID 
    
    var jobLogbt = await job.createJob(jobHash + 'bottom', expiredTime, timeBid, 400e18, 'bottom',bboAddress, {
      from: userA
    });

    var jobLog = await job.createJob(jobHash + 'dddd', expiredTime, timeBid, 333e18, 'banner', bboAddress,{
      from: userA
    });

    await job.createJob(jobHash + 'topp', expiredTime, timeBid, 500e18, 'topp', bboAddress,{
      from: userB
    });
    
    
    var myContract = await new web3.eth.Contract(job.abi, job.address, {
      from: userA, // default from address
      gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
    });
    
    
    var key0 = web3.utils.toHex('banner');
    var key1 = web3.utils.toHex('bottom');

    try {
      await myContract.getPastEvents('JobCreated', {
        filter: {
          category: [key0, key1],
          owner: userA
        }, // filter by owner, category
        fromBlock: 0, // should use recent number
        toBlock: 'latest'
      }, function (error, events) {
        //TODO
        if (error) {
          
          //console.s.log(error);
        }
        
      }).then(function (events) {
        
      });



    } catch (e) {
      
    }

    const jobHashRs1 = jobLog.logs.find(l => l.event === 'JobCreated').args
    
    const jobHashRs = jobHashRs1.jobHash
    assert.equal(jobHash + 'dddd', web3.utils.hexToUtf8(jobHashRs));
  });


  it("[Fail] create new job with long category", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600;
    //days

    var longCa = '';
    for (var i = 0; i < 33; i++) {
      longCa += 'a';
    }
    
    try {
      var jobLog = await job.createJob(jobHash + '21', expiredTime, timeBid, 500e18, longCa,bboAddress, {
        from: userA
      });
      
      return false;
    } catch (e) {
      
      return true;
    }

  });

  it("[Fail] create new job with exist jobHash", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600;
    //days

    try {
      var jobLog = await job.createJob(jobHash, expiredTime, timeBid, 500e18, 'banner',bboAddress, {
        from: userA
      });
      return false;
    } catch (e) {
      return true;
    }

  });
  it("[Fail] create new job with budget =0", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600;
    3 //days
    try {
      var jobLog = await job.createJob(jobHash + '0', expiredTime, timeBid, 0, 'banner',bboAddress, {
        from: userA
      });
      return false;
    } catch (e) {
      return true;
    }

  });
  it("[Fail] create new job with expired < now ", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) - 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600;
    //days
    try {
      var jobLog = await job.createJob(jobHash + '1', expiredTime, timeBid, 500e18, 'banner',bboAddress, {
        from: userA
      });
      return false;
    } catch (e) {
      return true;
    }

  });
  //TranTho
  it("[Fail] create new job with budget < 0", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600;
    3 //days
    try {
      var jobLog = await job.createJob(jobHash + 'x', expiredTime, timeBid, -1, 'banner',bboAddress, {
        from: userA
      });
      return false;
    } catch (e) {
      return true;
    }

  });

  it("[Fail] create new job with time progess = 0", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 0; //8 days

    try {
      var jobLog = await job.createJob(jobHash + 'xk', expiredTime, timeBid, 100e18, 'banner', bboAddress,{
        from: userA
      });
      
      return false;
    } catch (e) {
      
      
      return true;
    }

  });

  it("get jobID by jobHash", async () => {
    var userA = accounts[0];

    let job = await BBFreelancerJob.at(proxyAddressJob);
    let j = await job.getJobID(jobHashX, {
      from: userA
    });

    assert.equal(JSON.stringify(j),JSON.stringify(jobIDM));
  });


  it("[Fail] start job without not bid", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var userB = accounts[1];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600; // 3 days

    var jobLog = await job.createJob(jobHash + 'z', expiredTime, timeBid, 500e18, 'banner', bboAddress,{
      from: userA
    });

    let jobIDx = jobLog.logs.find(l => l.event === 'JobCreated').args.jobID;

    try {
     
     // console.log(JSON.stringify(jobIDx));
       await job.startJob(jobIDx, {
        from: userB
      });
      return false;
    } catch (e) {
      return true;
    }

  });


  it("[Fail] bid > buget", async () => {
    var userB = accounts[2];
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 3 * 24 * 3600; //days

    try {
      var jobLog = await bid.createBid(jobID, 501e18, timeDone, {
        from: userB
      });
      return false;
    } catch (e) {
      return true;
    }

  });

  

  it("[Fail] get stograge ", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 0; //8 days

    try {
      var jobLog = await job.getStorage({
        from: userA
      });
      
      return false;
    } catch (e) {
      
      
      return true;
    }

  });

  it("[Fail] owner bid themself job", async () => {
    var userA = accounts[0];
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 3 * 24 * 3600;
    //days
    try {
      var jobLog = await bid.createBid(jobID, 500e18, timeDone, {
        from: userA
      });
      console.log('[Fail] owner bid themself job OK');
      return false;
    } catch (e) {
      return true;
    }

  });

  it("[Fail] not owner cancel job", async () => {
    var userB = accounts[1];
    let job = await BBFreelancerJob.at(proxyAddressJob);
    try {
      await job.createJob(jobHashWilcancel, expiredTime, timeBid, 500e18, 'banner',bboAddress, {
        from: userB
      });
      return false;
    } catch (e) {
      return true;
    }

  });


  it("Owner cancel job and refund BBO", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    let bbo = await BBOTest.at(bboAddress);
    var userA = accounts[0];
    var userB = accounts[1];
    var userC = accounts[2];
    var userD = accounts[3];


    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 8 * 24 * 3600; //8 days

    let jobLog =  await job.createJob(jobHash + 'xkop', expiredTime, timeBid, 1000e18, 'banner',bboAddress, {
      from: userA
    });

    let jobIDx = jobLog.logs.find(l => l.event === 'JobCreated').args.jobID;

    jobLog =  await job.createJob(jobHash + 'xkopcc', expiredTime, timeBid, 1000e18, 'banner',bboAddress, {
      from: userA
    });

    jobIDR = jobLog.logs.find(l => l.event === 'JobCreated').args.jobID;

    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 3 * 24 * 3600;

    await bid.createBid(jobIDx, 500e18, timeDone, {
      from: userB
    });
    await bid.createBid(jobIDR, 500e18, timeDone, {
      from: userB
    });

    await bid.createBid(jobIDx, 600e18, timeDone, {
      from: userC
    });
    await bid.createBid(jobIDx, 400e18, timeDone, {
      from: userD
    });

    let balancee = await getBalance(bbo, userA);
    
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });
    await bid.acceptBid(jobIDx, userB, {
      from: userA
    });
    await bid.acceptBid(jobIDR, userB, {
      from: userA
    });
    let balancex = await getBalance(bbo, userA);
    
    // Cancel Bid
    await bid.cancelBid(jobIDx, {
      from: userB
    });

    await bid.acceptBid(jobIDx, userD, {
      from: userA
    });

    await bid.cancelBid(jobIDx, {
      from: userA
    });

    await bid.acceptBid(jobIDx, userC, {
      from: userA
    });

    let balance = await getBalance(bbo, userA);
    

    await bid.acceptBid(jobIDx, userD, {
      from: userA
    });

    let balancey = await getBalance(bbo, userA);
    

    //Job ownwer cancel job
    await job.cancelJob(jobIDx, {
      from: userA
    });

    let balancen = await getBalance(bbo, userA);
    
    assert(balancen > balance);

  });

  
  it("cancel job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600; //3 days
    let jobLog =  await job.createJob(jobHashWilcancel, expiredTime, timeBid, 500e18, 'banner', bboAddress,{
      from: userA
    });
    let jobIDxx = jobLog.logs.find(l => l.event === 'JobCreated').args.jobID;
    jobLog = await job.cancelJob(jobIDxx, {
      from: userA
    });
     const jobIDm = jobLog.logs.find(l => l.event === 'JobCanceled').args.jobID
  
     assert.equal(JSON.stringify(jobIDm), JSON.stringify(jobIDxx));

  });


  it("create createMultipleBid", async () => {
    var listJobHash = [];
    var listTime = [];
    var listBid = [];
    var listJobID = [];

    let job = await BBFreelancerJob.at(proxyAddressJob);

    for(var i = 0; i < 4; i++) {
      var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
      var timeBid = 3 * 24 * 3600; //3 days
      listJobHash.push(jobHashWilcancel +'xx' + i);
      listTime.push(timeBid);
      listBid.push(100e18);
      let jobLog = await job.createJob(jobHashWilcancel +'xx' + i, expiredTime, timeBid, 200e18, 'banner',bboAddress, {
        from: accounts[i]
      });
      let jobHashRs = jobLog.logs.find(l => l.event === 'JobCreated').args
      listJobID.push(jobHashRs.jobID);
    }

    listBid[1] = 300e18;
  
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    let bbo = await BBOTest.at(bboAddress);
    let userA = accounts[3];
    await bid.createMultipleBid(listJobID, listBid,listTime, {
      from : accounts[5]
    });
    
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });

    var jobLog = await bid.acceptBid(listJobID[3], accounts[5], {
      from: userA
    });

    
    
    const jobID = jobLog.logs.find(l => l.event === 'BidAccepted').args.jobID
     assert.equal(JSON.stringify(listJobID[3]), JSON.stringify(jobID));

  });




  it("createSingleBid with job cancel", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var userB = accounts[1];

    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600; //3 days
    let jobLog = await job.createJob(jobHashWilcancel + 'kmd', expiredTime, timeBid, 500e18, 'banner', bboAddress,{
      from: userA
    });
    let jobIDX = jobLog.logs.find(l => l.event === 'JobCreated').args.jobID
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 1 * 24 * 3600; //days

    await bid.createSingleBid(jobIDX, 300e18, timeDone, {
      from: userA
    });
    await bid.createSingleBid(jobIDX, 700e18, timeDone, {
      from: userB
    });

    await job.cancelJob(jobIDX, {
      from: userA
    });

    jobLog = await bid.createSingleBid(jobIDX, 300e18, timeDone, {
      from: userB
    });
    assert(jobLog.logs.length <= 0);

  });


var jobIDd = 0;
  it(" createSingleBid with job start", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var userB = accounts[1];
    var userC = accounts[2];

    var expiredTime = parseInt(Date.now() / 1000) + 1 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600; //3 days
    let jobLog = await job.createJob(jobHashWilcancel + 'aaa', expiredTime, timeBid, 500e18, 'banner', bboAddress,{
      from: userA
    });
    let jobIDX = jobLog.logs.find(l => l.event === 'JobCreated').args.jobID
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 1 * 24 * 3600; //days

    jobLog = await job.createJob(jobHashWilcancel + 'ccc', expiredTime, timeBid, 500e18, 'banner', bboAddress,{
      from: userA
    });
    jobIDd =  jobLog.logs.find(l => l.event === 'JobCreated').args.jobID

    await bid.createSingleBid(jobIDX, 300e18, timeDone, {
      from: userB
    });

    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });

    await bid.acceptBid(jobIDX, userB, {
      from: userA
    });

    await job.startJob(jobIDX, {
      from: userB
    });

    await job.startJob(jobIDR, {
      from: userB
    });

    jobLog = await bid.createSingleBid(jobIDX, 350e18, timeDone, {
      from: userC
    });

    assert(jobLog.logs.length <= 0);

  });


  it("fast forward to  1 day + 1 sec", function () {
    var fastForwardTime = 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

  it("createSingleBid job EXPIRED", async () => {
    var userB = accounts[1];
   
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 1 * 24 * 3600; //days

    let jobLog =  await bid.createSingleBid(jobIDd, 300e18, timeDone, {
      from: userB
    });

    assert(jobLog.logs.length <= 0);
  });



  it("[Fail] createSingleBid job has freelancer", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[1];
    var userB = accounts[2];
    var userC = accounts[3];
    var userD = accounts[4];

    
    jobHashWilcancel ='sadasqeq';
    var expiredTime = parseInt(Date.now() / 1000) + 3 * 24 * 3600; // expired after 1 days
    var timeBid = 3 * 24 * 3600; //3 days
    let jobLog =  await job.createJob(jobHashWilcancel + 'ahihi', expiredTime, timeBid, 500e18, 'banner',bboAddress, {
      from: userA
    });
    let jobIDx  =  jobLog.logs.find(l => l.event === 'JobCreated').args.jobID

    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 1 * 24 * 3600; //days

    await bid.createSingleBid(jobIDx, 300e18, timeDone, {
      from: userB
    });

    await bid.createSingleBid(jobIDx, 300e18, 0, {
      from: userD
    });

    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });

    await bid.acceptBid(jobIDx, userB, {
      from: userA
    });

    
    jobLog = await bid.createSingleBid(jobIDx, 300e18, timeDone, {
      from: userC
    });

    assert(jobLog.logs.length <= 0);

  });


  it("createSingleBid job Owner bid", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];

    
    var expiredTime = parseInt(Date.now() / 1000) + 4 * 24 * 3600; // expired after 1 days
    var timeBid = 3 * 24 * 3600; //3 days
    let jobLog =  await job.createJob(jobHashWilcancel + 'bbbkl', expiredTime, timeBid, 500e18, 'banner',bboAddress, {
      from: userA
    });

    let jobIDx  =  jobLog.logs.find(l => l.event === 'JobCreated').args.jobID
   
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 1 * 24 * 3600; //days

    jobLog = await bid.createSingleBid(jobIDx, 300e18, timeDone, {
      from: userA
    });

    assert(jobLog.logs.length <= 0);

  });

 

  it("create bid", async () => {
    var userB = accounts[1];
    var userC = accounts[2];
    var userD = accounts[4];


    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 3 * 24 * 3600; //3 days
    
    await bid.createBid(jobID, 400e18, timeDone, {
      from: userB
    });
    await bid.createBid(jobID, 350e18, timeDone, {
      from: userC
    });
    let jobLog = await bid.createBid(jobID, 370e18, timeDone, {
      from: userD
    });
    
    const jobIDx = jobLog.logs.find(l => l.event === 'BidCreated').args.jobID

    assert.equal(JSON.stringify(jobIDx), JSON.stringify(jobID));

  });

  it("[Fail] Check function bid ", async () => {
    var userB = accounts[2];
    var userA = accounts[0];
    var userC = accounts[3];

    let job = await BBFreelancerJob.at(proxyAddressJob);

    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600; //3 days
    let jobLog = await job.createJob(jobHash + 'xv', expiredTime, timeBid, 500e18, 'banner', bboAddress,{
      from: userA
    });

    let jobIDx  =  jobLog.logs.find(l => l.event === 'JobCreated').args.jobID


    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 1 * 24 * 3600; //days

    await bid.createBid(jobIDx, 300e18, timeDone, {
      from: userB
    });

    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });



    await bid.acceptBid(jobIDx, userB, {
      from: userA
    });

    try {
      
      await bid.createBid(jobIDx, 300e18, timeDone, {
        from: userC
      });
      console.log("[Fail] Check function bid OK");
      return false;
    } catch (e) {
      
      return true;
    }

  });


  it("acceept bid userC", async () => {
    var userA = accounts[0];
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });

    var jobLog = await bid.acceptBid(jobID, accounts[2], {
      from: userA
    });
    
    
    const jobHashRs = jobLog.logs.find(l => l.event === 'BidAccepted').args.jobID
    assert.equal(JSON.stringify(jobID), JSON.stringify(jobHashRs));

  });

  


  it("acceept bid userB", async () => {
    var userA = accounts[0];
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    let bbo = await BBOTest.at(bboAddress);

    let balancee = await getBalance(bbo, userA);
        
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });
   await bid.acceptBid(jobID, accounts[1], {
      from: userA
    });
    
    let balanceex = await getBalance(bbo, userA);
     
     assert(balanceex.toNumber() < balancee.toNumber());
  });

  async function getBalance(token, address) {
    return await token.balanceOf(address, {
      from: accounts[0]
    });
  }


  it("[Fail] UserD cancel job", async () => {
    var userB = accounts[1];
    var userD = accounts[4];
    let bid = await BBFreelancerBid.at(proxyAddressBid);

    try {

      await bid.cancelBid(jobID, {
        from: userD
      });

      return false;
    } catch (e) {
      return true;
    }
  });

  it("[Fail] Not freelancer start working job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userD = accounts[4];
    try {
      var jobLog = await job.startJob(jobID, {
        from: userD
      });
      return false;
    } catch (e) {
      return true;
    }
  });

  it("start working job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userB = accounts[1];
    var jobLog = await job.startJob(jobID, {
      from: userB
    });
    const jobHashRs1 = jobLog.logs.find(l => l.event === 'JobStarted').args
    
    const jobHashRs = jobHashRs1.jobID
    assert.equal(JSON.stringify(jobID), JSON.stringify(jobHashRs));
  });


  it("[Fail] cancel job when freelancer don't work", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    try {
    
      var jobStatus = await job.getJob(jobID,{
        from: userA
      });

      //console.log(JSON.stringify(jobStatus)); 

      var jobLog = await job.cancelJob(jobID,{
        from: userA
      });
      
      console.log('[Fail] cancel job when freelancer do"t work');
      return false;
    } catch (e) {
      

      return true;
    }

  });

  it("[Fail] userC start working userB's job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var userB = accounts[1];
    var userC = accounts[2];

    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 1 * 24 * 3600;

    //Hirer create job
    let jobLog =  await job.createJob(jobHash + 'jx', expiredTime, timeBid, 100e18, 'banner', bboAddress,{
      from: userA
    });

    let jobIDx  =  jobLog.logs.find(l => l.event === 'JobCreated').args.jobID


    //UserB bid
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 1; //days
    await bid.createBid(jobIDx, 100e18, timeDone, {
      from: userB
    });

    //Hirer acept Bid
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });
    await bid.acceptBid(jobIDx, accounts[1], {
      from: userA
    });

    //UserB start Job
    try {
       await job.startJob(jobIDx, {
        from: userC
      });
      console.log("[Fail] userC start working userB's job OK");
      return false;

    } catch (e) {
      
      return true;
    }
  });


  it("[Fail] Freelancer accept  bid", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var userB = accounts[1];
    var userC = accounts[2];
   
      var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
      var timeBid = 1 * 24 * 3600;

      //Hirer create job
      let jobLog = await job.createJob(jobHash + 'jxc', expiredTime, timeBid, 100e18, 'banner',bboAddress, {
        from: userA
      });

      let jobIDx  =  jobLog.logs.find(l => l.event === 'JobCreated').args.jobID


      //UserB bid
      let bid = await BBFreelancerBid.at(proxyAddressBid);
      var timeDone = 1; //days
      await bid.createBid(jobIDx, 100e18, timeDone, {
        from: userB
      });

      //UserC bid
      var timeDone = 1; //days
      await bid.createBid(jobIDx, 100e18, timeDone, {
        from: userC
      });

      //Hirer acept Bid user B
      let bbo = await BBOTest.at(bboAddress);
      await bbo.approve(bid.address, 0, {
        from: userA
      });
      await bbo.approve(bid.address, Math.pow(2, 255), {
        from: userA
      });
      await bid.acceptBid(jobIDx, userB, {
        from: userA
      });

      try {

      //Hirer acept Bid user C

      await bid.acceptBid(jobIDx, userC, {
        from: userC
      });

      console.log('[Fail] Freelancer accept  bid');
      
      return false;

     } catch (e) {
      
       return true;
     }
  });




  it("[Fail] not freelancer of this job finish job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userB = accounts[2];
    try {
      var jobLog = await job.finishJob(jobID, {
        from: userB
      });
      console.log('[Fail] not freelancer of this job finish job');
      return false;
    } catch (e) {
      

      return true;
    }

  });



  it("[Fail] Hirer finish job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userB = accounts[0];
    try {
      var jobLog = await job.finishJob(jobID, {
        from: userB
      });
      console.log('[Fail] Hirer finish job');

      return false;
    } catch (e) {
      
      return true;
    }

  });




  it("finish job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userB = accounts[1];
    var jobLog = await job.finishJob(jobID, {
      from: userB
    });
    await job.finishJob(jobIDR, {
      from: userB
    });
    const jobHashRs1 = jobLog.logs.find(l => l.event === 'JobFinished').args
    
    const jobHashRs = jobHashRs1.jobID
    assert.equal(JSON.stringify(jobID), JSON.stringify(jobHashRs));
  });



  it("[Fail] cancel job after finish job", async () => {

    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    try {
      var jobLog = await job.cancelJob(jobID, {
        from: userA
      });
      return false;
    } catch (e) {
      return true;
    }

  });


  it("reject payment", async () => {
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    var userA = accounts[0];
    var jobLog = await payment.rejectPayment(jobID, 1, {
      from: userA
    });
    await payment.rejectPayment(jobIDR, 1, {
      from: userA
    });
    const jobHashRs1 = jobLog.logs.find(l => l.event === 'PaymentRejected').args
    
    const jobHashRs = jobHashRs1.jobID
    assert.equal(JSON.stringify(jobID), JSON.stringify(jobHashRs));

  });

  it("[Fail] reject payment with reasion = 0", async () => {
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    var userA = accounts[0];
    try {
      await payment.rejectPayment(jobID, 0, {
        from: userA
      });
      return false;
    } catch (e) {
      return true;

    }

  });

  ;


  it("check payment", async () => {
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    var userA = accounts[0];
    var rs = await payment.checkPayment(jobID, {
      from: userA
    });
    return true;
  });
  it("[Fail] cancel job after reject payment", async () => {

    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    try {
      var jobLog = await job.cancelJob(jobID, {
        from: userA
      });
      
      return false;
    } catch (e) {
      
      return true;
    }

  });

  


  it("acceept payment", async () => {
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    var userA = accounts[0];
    var jobLog = await payment.acceptPayment(jobID, {
      from: userA
    });
    const jobHashRs1 = jobLog.logs.find(l => l.event === 'PaymentAccepted').args
    
    const jobHashRs = jobHashRs1.jobID
    assert.equal(JSON.stringify(jobID), JSON.stringify(jobHashRs));

  });

  it("[Fail] userB get userA's payment ", async () => {

    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var userB = accounts[1];
    try {
      var jobLog = await bid.getPaymentContract({
        from: userB
      });
      return false;
    } catch (e) {
      return true;
    }

  });


  it("[Fail] cancel job after acceept payment", async () => {

    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    try {
      var jobLog = await job.cancelJob(jobID, {
        from: userA
      });
      
      return false;
    } catch (e) {
      
      return true;
    }

  });



  it("get job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var jobLog = await job.getJob(jobID);
    assert.equal(jobLog[0], accounts[0]);
  });

  it("set timeout payment", async () => {
    let storage = await BBStorage.at(storageAddress);
    await storage.setUint(web3.utils.sha3('PAYMENT_LIMIT_TIMESTAMP'), 24 * 3600, {
      from: accounts[7]
    });

    var rs = await storage.getUint(web3.utils.sha3('PAYMENT_LIMIT_TIMESTAMP'), {
      from: accounts[0]
    });
    assert.equal(rs, 24 * 3600);
  });

  var jobIDc;

  it("start other job for claime payment", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600;
    //days
    let jobLog =  await job.createJob(jobHash3, expiredTime, timeBid, 500e18, 'banner',bboAddress, {
      from: userA
    });

    let jobIDx  =  jobLog.logs.find(l => l.event === 'JobCreated').args.jobID

    var userB = accounts[2];
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 3 * 24 * 3600;
    //days
    await bid.createBid(jobIDx, 400e18, timeDone, {
      from: userB
    });
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });
    await bid.acceptBid(jobIDx, userB, {
      from: userA
    });

    await job.startJob(jobIDx, {
      from: userB
    });
    await job.finishJob(jobIDx, {
      from: userB
    });

    jobIDc = jobIDx;

  });

  



  it("fast forward to 24h after locked", function () {
    var fastForwardTime = 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

  it("[Fail] Hirer claime payment", async () => {
    var userA = accounts[0];

    try {

      let payment = await BBFreelancerPayment.at(proxyAddressPayment);
      var jobLog = await payment.claimePayment(jobIDc, {
        from: userA
      });

      console.log('[Fail] Hirer claime payment');
      return false;

    } catch (e) {
      
      return true;
    }

  });


  it("[Fail] UserC claime payment UserB'job", async () => {

    try {

      let payment = await BBFreelancerPayment.at(proxyAddressPayment);
      var jobLog = await payment.claimePayment(jobIDc, {
        from: userC
      });  
      return false;

    } catch (e) {
      
      return true;
    }
  });

  it("Client claime payment", async () => {
    var userB = accounts[0];

    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    var jobLog = await payment.claimePayment(jobIDR, {
      from: userB
    });
    const jobHashRs1 = jobLog.logs.find(l => l.event === 'PaymentClaimed').args
    
    const jobHashRs = jobHashRs1.jobID
    assert.equal(JSON.stringify(jobIDR), JSON.stringify(jobHashRs));
  });

  it("claime payment", async () => {
    var userB = accounts[2];

    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    var jobLog = await payment.claimePayment(jobIDc, {
      from: userB
    });
    const jobHashRs1 = jobLog.logs.find(l => l.event === 'PaymentClaimed').args
    
    const jobHashRs = jobHashRs1.jobID
    assert.equal(JSON.stringify(jobIDc), JSON.stringify(jobHashRs));

  });


  var jobIDb;

  it("start other job for finalize payment", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600;
    //days
    let jobLog = await job.createJob(jobHash4, expiredTime, timeBid, 500e18, 'banner', bboAddress,{
      from: userA
    });
    jobIDb  =  jobLog.logs.find(l => l.event === 'JobCreated').args.jobID

    var userB = accounts[2];
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 3 * 24 * 3600;
    //days
    await bid.createBid(jobIDb, 400e18, timeDone, {
      from: userB
    });
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });
    await bid.acceptBid(jobIDb, userB, {
      from: userA
    });

    await job.startJob(jobIDb, {
      from: userB
    });
    await job.finishJob(jobIDb, {
      from: userB
    });
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    await payment.rejectPayment(jobIDb, 1, {
      from: userA
    });

    // set the dispute winner 
    let bbs = await BBStorage.at(storageAddress);
    await bbs.addAdmin(userA, true, {
      from: userA
    });
    //console.log(JSON.stringify(jobIDb));
    await bbs.setAddress(web3.utils.soliditySha3(jobIDb,'DISPUTE_WINNER'), userB, {
      from: userA
    });
    let u = await bbs.getAddress(web3.utils.soliditySha3(jobIDb,'DISPUTE_WINNER'));
    assert.equal(userB, u);
  });
  it("finalize payment", async () => {
    var userB = accounts[2];

    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    var jobLog = await payment.finalizeDispute(jobIDb, {
      from: userB
    });
    const jobHashRs1 = jobLog.logs.find(l => l.event === 'DisputeFinalized').args
   // console.log(JSON.stringify(jobHashRs1));
    const jobHashRs = jobHashRs1.jobID;
     assert.equal(JSON.stringify(jobIDb), JSON.stringify(jobHashRs));

    assert.equal(userB, jobHashRs1.winner);

  });

  it("emergencyERC20Drain", async () => {
    var userA = accounts[0];
    let bbo = await BBOTest.at(bboAddress);
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    var jobLog = await payment.emergencyERC20Drain(bbo.address, {
      from: userA
    });


  });

  it("start other job for ETH payment", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600;
    //days
    let jobLog =  await job.createJob(jobHash3, expiredTime, timeBid, 500e18, 'banner','0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeebb0', {
      from: userA
    });

    let jobIDx  =  jobLog.logs.find(l => l.event === 'JobCreated').args.jobID

    var userB = accounts[2];
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 3 * 24 * 3600;
    //days
    await bid.createBid(jobIDx, 4e18, timeDone, {
      from: userB
    });
    let bbo = await BBOTest.at(bboAddress);
    
    await bid.acceptBid(jobIDx, userB, {
      from: userA,
      value: 4e18
    });

    await job.startJob(jobIDx, {
      from: userB
    });
    await job.finishJob(jobIDx, {
      from: userB
    });

    jobIDc = jobIDx;

  });

  



  it("fast forward to 24h after locked", function () {
    var fastForwardTime = 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

})