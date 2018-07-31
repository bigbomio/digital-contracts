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