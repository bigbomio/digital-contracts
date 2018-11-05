# BBFreelancerBid

Contract **BBFreelancerBid** is *BBFreelancer* 

imports: [BBFreelancerPayment.sol](../../src/contracts/BBFreelancerPayment.sol), [BBLib.sol](../../src/contracts/BBLib.sol), [BBFreelancer.sol](../../src/contracts/BBFreelancer.sol)

Source: [BBFreelancerBid.sol](../../src/contracts/BBFreelancerBid.sol)

BBFreelancerBid is the contract implements Bidding actions for Freelancer app

   * [Events](#events)
      * [BidCreated](#bidcreated)
      * [BidCanceled](#bidcanceled)
      * [BidAccepted](#bidaccepted)
   * [Functions](#functions)
      * [setPaymentContract](#setpaymentcontract)
      * [createBid](#createbid)
      * [cancelBid](#cancelbid)
      * [acceptBid](#acceptbid)

## Events

### BidCreated
Event for logging Bid creations.

---
event BidCreated(uint256 indexed jobID , address indexed owner, uint256 bid, uint256 bidTime)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256          | job ID|
| `owner`         | address          |  address of the creator|
| `bid`           | uint256          |  amount BBO for this Bid|
| `bidTime`       | uint256          |  total work hours for this bid (stored as second)|


### BidCanceled
Event for logging the canceled Bid .

---
event BidCanceled(uint256 indexed jobID, address indexed owner);

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256          | `job ID |
| `owner`         | address          |  address of the creator|


### BidAccepted
Event for logging Bid creations.

---
event BidAccepted(uint256 indexed jobID , address indexed freelancer);

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256          | job ID |
| `freelancer`         | address     |  address of the creator of this bid|


## Functions

### setPaymentContract
Set the address of the FreelancerPayment contract. Only invoked by owner.

---

function setPaymentContract(address paymentAddress) onlyOwner public 

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `paymentAddress`       | address       | the address of the `FreelancerPayment` contract |

### createBid
Allow the freelancer to create new bid for job hash.

---

function createBid(uint256 jobID, uint256 bid, uint bidTime) public 
   isNotOwnerJob(jobID)
   isNotCanceled(jobID)
   jobNotStarted(jobID) 

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256            | job ID|
| `bid`           | uint256          |  amount BBO for this Bid|
| `bidTime`       | uint256          |  total work hours for this bid (stored as second)|

Modifiers: `isNotOwnerJob`, `isNotCanceled`, `jobNotStarted`

### cancelBid
Allow the freelancer to cancel the bid by job hash.

---

function cancelBid(uint256 jobID) public isNotOwnerJob(jobHash) 

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes            | job Hash|

Modifiers: `isNotOwnerJob`

### acceptBid
Allow the hirer to accept the bid for job hash.

---

function acceptBid(bytes jobHash, address freelancer) public


| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256            | job ID|
| `freelancer`       | address            | address of the bid want to accept|

