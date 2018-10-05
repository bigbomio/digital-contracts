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
event PaymentClaimed(bytes32 indexed indexJobHash, address indexed sender, bytes jobHash);
| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `indexJobHash`       | bytes32       |  Hash of the job store on IPFS  |
| `sender`       | address       |  user call claim payment  |
| `jobHash`       | bytes       |  Hash of the job store on IPFS  |

### PaymentClaimed
Event for loging payment accepted.

---
event PaymentAccepted(bytes32 indexed indexJobHash, address indexed sender, bytes jobHash);
| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `indexJobHash`       | bytes32       |  Hash of the job store on IPFS  |
| `sender`       | address       |  user call accept payment  |
| `jobHash`       | bytes       |  Hash of the job store on IPFS  |



### PaymentRejected
Event for loging payment rejected.

---
event PaymentRejected(bytes32 indexed indexJobHash, address indexed sender, uint reason, uint256 rejectedTimestamp, bytes jobHash);

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `indexJobHash`       | bytes32       |  Hash of the job store on IPFS  |
| `sender`       | address       |  user call reject payment  |
| `reason`       | uint       |  reason for rejection  |
| `rejectedTimestamp`       | uint       |  rejected timetamp  |
| `jobHash`       | bytes       |  Hash of the job store on IPFS  |


### DisputeFinalized
Event for loging payment claim.

---
event DisputeFinalized(bytes32 indexed indexJobHash, address indexed winner, bytes jobHash);

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `indexJobHash`       | bytes32       |  Hash of the job store on IPFS  |
| `winner`       | address       | address has won the dispute  |
| `jobHash`       | bytes       |  Hash of the job store on IPFS  |

## Functions

### acceptPayment
Hirer accept the payment when the freelancer done the job

---
function acceptPayment(bytes jobHash)  public 
  isOwnerJob(jobHash)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes       |  Hash of the job store on IPFS  |

Modifiers: `isOwnerJob`

### rejectPayment
Hirer reject the payment when the freelancer done the job

---
function rejectPayment(bytes jobHash, uint reason) public 
  isOwnerJob(jobHash)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes       |  Hash of the job store on IPFS  |
| `reason`       | uint       |  reason for rejection  |

Modifiers: `isOwnerJob`

### claimePayment
The freelancer can claim the payment if the hirer does not accept/reject after X duration.

---
function claimePayment(bytes jobHash) public isFreelancerOfJob(jobHash)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes       |  Hash of the job store on IPFS  |

Modifiers: `isFreelancerOfJob`


### checkPayment
The freelancer can check the payment of this job for ready claim

---
function checkPayment(bytes jobHash) public view returns(uint256, uint256)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes       |  Hash of the job store on IPFS  |

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
| `jobHash`       | bytes       |  Hash of the job store on IPFS  |


### refundBBO
refund token to hirer if canceled

---
function refundBBO(bytes jobHash) public  returns(bool) {

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes       |  Hash of the job store on IPFS  |



