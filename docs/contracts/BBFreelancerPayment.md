# BBFreelancerPayment

Contract **BBFreelancerPayment** is *BBFreelancer* 

imports: [BBFreelancer.sol](../../src/contracts/BBFreelancer.sol), [BBLib.sol](../../src/contracts/BBLib.sol)

Source: [BBFreelancerPayment.sol](../../src/contracts/BBFreelancerPayment.sol)

BBFreelancerPayment is the contract control the payment for Freelancer app

   * [BBFreelancerPayment](#bbfreelancerpayment)
      * [Events](#events)
         * [PaymentClaimed](#paymentclaimed)
         * [PaymentClaimed](#paymentclaimed-1)
         * [PaymentRejected](#paymentrejected)
         * [DisputeFinalized](#disputefinalized)
      * [Functions](#functions)
         * [acceptPayment](#acceptpayment)
         * [rejectPayment](#rejectpayment)
         * [claimePayment](#claimepayment)
         * [checkPayment](#checkpayment)
         * [finalizeDispute](#finalizedispute)
         * [refundBBO](#refundbbo)

## Events


### PaymentClaimed
Event for loging payment claimed.

---
event PaymentClaimed(uint256 jobID, address indexed sender);

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of Job  |
| `sender`       | address       |  user call claim payment  |
| `jobHash`       | bytes       |  Hash of the job store on IPFS  |

### PaymentClaimed
Event for loging payment accepted.

---
event PaymentAccepted(uint256 jobID, address indexed sender);

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of Job  |
| `sender`       | address       |  user call accept payment  |
| `jobHash`       | bytes       |  Hash of the job store on IPFS  |



### PaymentRejected
Event for loging payment rejected.

---
event PaymentRejected(bytes32 indexed indexJobHash, address indexed sender, uint reason, uint256 rejectedTimestamp, bytes jobHash);

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of Job  |
| `sender`       | address       |  user call reject payment  |
| `reason`       | uint       |  reason for rejection  |
| `rejectedTimestamp`       | uint       |  rejected timetamp  |
| `jobHash`       | bytes       |  Hash of the job store on IPFS  |


### DisputeFinalized
Event for loging payment claim.

---
event DisputeFinalized(uint256 jobID, address indexed winner);

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of Job  |
| `winner`       | address       | address has won the dispute  |
| `jobHash`       | bytes       |  Hash of the job store on IPFS  |

## Functions

### acceptPayment
Hirer accept the payment when the freelancer done the job

---
function acceptPayment(uint256 jobID)  public 
  isOwnerJob(jobHash)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job  |

Modifiers: `isOwnerJob`

### rejectPayment
Hirer reject the payment when the freelancer done the job

---
function rejectPayment(bytes jobHash, uint reason) public 
  isOwnerJob(jobHash)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job  |
| `reason`       | uint       |  reason for rejection  |

Modifiers: `isOwnerJob`

### claimePayment
The freelancer can claim the payment if the hirer does not accept/reject after X duration.

---
function claimePayment(uint256 jobID) public isFreelancerOfJob(jobHash)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job |

Modifiers: `isFreelancerOfJob`


### checkPayment
The freelancer can check the payment of this job for ready claim

---
function checkPayment(uint256 jobID) public view returns(uint256, uint256)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job  |

Returns:

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `status`       | uint256       |  status of job |
| `pendingDate`       | uint256       |  after this date freelancer can claim the payment |

### finalizeDispute
Finalize dispute job and send payment for the winer

---
 function finalizeDispute(bytes jobHash)  public returns(bool) 

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job |


### refundBBO
refund token to hirer if canceled

---
function refundBBO(bytes jobHash) public  returns(bool) {

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job  |



