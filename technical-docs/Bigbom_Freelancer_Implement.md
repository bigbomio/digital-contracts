# How to work with Bigbom Freelancer DApp

### Ropsten Contract Information 

* BBO: `0x1d893910d30edc1281d97aecfe10aefeabe0c41b`
* proxyAddressJob: `0x62aa93f9dffec25daf9d2955d468194e996e8c87`
* proxyAddressBid: `0x0ff11890ef301dfd0fb37e423930b391836c69c9`
* proxyAddressPayment: `0x7b7e6f2b02a48bd24b5b1554fafff5f70547ab0a`

### Example

* Create new job

```javascript
let job = await BBFreelancerJob.at(proxyAddressJob);
var userA = '0x12312321';
var expiredTime = parseInt(Date.now()/1000) + 7 * 24 * 3600; // expired after 7 days
// createJob: jobHash, expiredTime, budget, category
var jobLog  = await job.createJob(jobHash, expiredTime, 500e18, 'banner', {from:userA});
// check event logs

    
```

* cancel job 
```javascript
     var jobLog  = await job.cancelJob(jobHash, {from:userA});
```
* create bid

```javascript
    var userB = '0x98988997897';
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var jobLog  = await bid.createBid(jobHash, 400e18, {from:userB});
```

* cancel bid
```javascript

    var jobLog  = await bid.cancelBid(jobHash, {from:userB});
```

* acceept bid
```javascript
	var userA = '0x12312321';
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    let bbo = await BBO.at(BBOAddress);// abi BBO contract
    // approve bid's BBO amount to contract proxyAddressBid
    await bbo.approve(proxyAddressBid, 400e18, {from:userA});
    // call accept function
    var jobLog  = await bid.acceptBid(jobHash, accounts[1], {from:userA});
```
* start working job
```javascript
     var jobLog  = await job.startJob(jobHash, {from:userB});
```
* finish job
```javascript
     var jobLog  = await job.finishJob(jobHash, {from:userB});
```
* reject payment
```javascript
     let payment = await BBFreelancerPayment.at(proxyAddressPayment);
     var userA = '';
     var jobLog  = await payment.rejectPayment(jobHash, {from:userA});
```
* claime payment
```javascript
     let payment = await BBFreelancerPayment.at(proxyAddressPayment);
     var userB = '';
     var jobLog  = await payment.claimePayment(jobHash, {from:userB});
```
* acceept payment
```javascript
     var jobLog  = await payment.acceptPayment(jobHash, {from:userA});
```

* view list job

```javascript
//  event JobCreated(bytes jobHash, address indexed owner, uint created, string category);

BBFreelancerJob.at(proxyAddressJob).getPastEvents('JobCreated', {
    filter: {owner: '0x123', category: ['banner','it']},  // filter by owner, category
    fromBlock: 0, // should use recent number
    toBlock: 'latest'
}, function(error, events){
	//TODO
	});
```

### Event lists:

- event JobCreated(bytes jobHash, address indexed owner, uint created, string category);
- event JobCanceled(bytes jobHash);
- event JobStarted(bytes jobHash);
- event JobFinished(bytes jobHash);
- event BidCreated(bytes jobHash, address indexed owner, uint256 bid, uint created);
- event BidCanceled(bytes jobHash, address indexed owner);
- event BidAccepted(bytes jobHash, address indexed freelancer);
- event PaymentClaimed(bytes jobHash, address indexed sender);
- event PaymentAccepted(bytes jobHash, address indexed sender);
- event PaymentRejected(bytes jobHash, address indexed sender);
