# BBFreelancerJob

Contract **BBFreelancerJob** is *BBFreelancer* 

imports: [BBFreelancerPayment.sol](../../src/contracts/BBFreelancerPayment.sol), [BBLib.sol](../../src/contracts/BBLib.sol), [BBFreelancer.sol](../../src/contracts/BBFreelancer.sol)

Source: [BBFreelancerJob.sol](../../src/contracts/BBFreelancerJob.sol)

BBFreelancerJob is the contract implements Job Posting actions for Freelancer app


  * [Events](#events)
     * [JobCreated](#jobcreated)
     * [JobCanceled](#jobcanceled)
     * [JobStarted](#jobstarted)
     * [JobFinished](#jobfinished)
  * [Functions](#functions)
     * [getJob](#getjob)
     * [createJob](#createjob)
     * [cancelJob](#canceljob)
     * [startJob](#startjob)
     * [finishJob](#finishjob)

## Events

### JobCreated
Event for logging new Job creations.

---
event JobCreated(bytes jobHash, address indexed owner, uint expired, bytes32 indexed category, uint256  budget, uint256 estimateTime);

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes          | Hash of the job store on IPFS|
| `owner`         | address          |  address of the creator|
| `expired`           | uint256          |  total time allow the freelancer can bid this job(stored as second)|
| `category`       | bytes32          |  Hash `keccak256` of the category, allow client can filter job by category|
| `budget`       | uint256          |  Max amount the hirer can pay for this job|
| `estimateTime`       | uint256          |  Max time for freelancer can do this job (stored as second)|

### JobCanceled
Event for logging canceled job.

---
event JobCanceled(bytes jobHash);


| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes          | Hash of the job store on IPFS|

### JobStarted
Event for logging started job.

---
event JobStarted(bytes jobHash);


| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes          | Hash of the job store on IPFS|

### JobFinished
Event for logging finished job.

---
event JobFinished(bytes jobHash);


| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes          | Hash of the job store on IPFS|

## Functions

### getJob
Get job detail by job hash.

---
function getJob(bytes jobHash) public view returns(address, uint256, uint256, bool, uint256, address)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes          | Hash of the job store on IPFS|

Returns:

| Return     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `owner`       | address          | owner of this job|
| `expired`       | uint256          | job bidding expired timestamp|
| `budget`       | uint256          | job buget|
| `cancel`       | bool          | `true` if job is canceled|
| `status`       | uint256          | see [status](#status)|
| `freelancer`       | address          | address of the freelancer of this job|


### createJob
Post new job

---
function createJob(bytes jobHash, uint expired ,uint estimateTime, uint256 budget, bytes32 category) public 
  jobNotExist(jobHash)


| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes          | Hash of the job store on IPFS|
| `expired`       | uint256          | job bidding expired timestamp|
| `estimateTime`       | uint256          |  Max time for freelancer can do this job (stored as second)|
| `budget`       | uint256          | max job buget|
| `category`       | bytes32          | Hash `keccak256` of the category, allow client can filter job by category|

Modifiers: `jobNotExist`


### cancelJob
Cancel a job by jobHash

---
function cancelJob(bytes jobHash) public 
  isOwnerJob(jobHash)


| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes          | Hash of the job store on IPFS|

Modifiers: `isOwnerJob`


### startJob
Start working on a job by jobHash

---
function startJob(bytes jobHash) public 
  isNotCanceled(jobHash)
  jobNotStarted(jobHash)
  isFreelancerOfJob(jobHash)


| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes          | Hash of the job store on IPFS|

Modifiers: `isNotCanceled`, `jobNotStarted`, `isFreelancerOfJob`


### finishJob
Finish working on a job by jobHash

---
function finishJob(bytes jobHash) public 
  isNotOwnerJob(jobHash) 
  isFreelancerOfJob(jobHash) 


| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes          | Hash of the job store on IPFS|

Modifiers: `isNotOwnerJob`, `isFreelancerOfJob`


### status
Job status mapping

---

| status             | Description                 |
| ------------- | ---------------------------:|
| `0`     | Job Initial|
| `1`     | Job Started|
| `2`     | Job Finished|
| `4`     | Job Payment Rejected|
| `5`     | Job Payment Claimed|
| `6`     | Job has Dispute (in-voting)|
| `9`     | Job Payment Accepted |


