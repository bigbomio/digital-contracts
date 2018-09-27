# BBDispute

Contract **BBDispute** is *BBStandard* 

imports: [BBStandard.sol](../../src/contracts/BBStandard.sol), [BBLib.sol](../../src/contracts/BBLib.sol), [BBFreelancerPayment.sol](../../src/contracts/BBFreelancerPayment.sol)

Source: [BBDispute.sol](../../src/contracts/BBDispute.sol)

BBDispute is the contract implements Poll creation actions for creating dispute in Freelancer app

  * [Events](#events)
     * [PollStarted](#pollstarted)
     * [PollAgainsted](#pollagainsted)
     * [PollFinalized](#pollfinalized)
  * [Functions](#functions)
     * [setPayment](#setpayment)
     * [isAgaintsPoll](#isagaintspoll)
     * [startPoll](#startpoll)
     * [againstPoll](#againstpoll)
     * [getPoll](#getpoll)
     * [finalizePoll](#finalizepoll)


## Events

### PollStarted
Event for logging start new poll.

---
event PollStarted(bytes jobHash, address indexed creator);

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes32       |  Hash of the jobHash store on IPFS  |
| `proofHash`     | proofHash   |  Hash of the job evident stored on IPFS |
| `creator`       | address       |  address who start the Poll  |

### PollAgainsted
Event for logging against the exist poll.

---
event PollAgainsted(bytes jobHash, address indexed creator);

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes32       |  Hash of the jobHash store on IPFS  |
| `proofHash`     | proofHash  |  Hash of the job evident stored on IPFS |
| `creator`       | address       |  address who against the Poll  |


### PollFinalized
Event for logging against the exist poll.

---
event PollFinalized(bytes jobHash, uint256 jobOwnerVotes, uint256 freelancerVotes, bool isPass);

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes32       |  Hash of the jobHash store on IPFS  |
| `jobOwnerVotes`       | uint256       |  number of votes for the hirer of this job  |
| `freelancerVotes`       | uint256       |  number of votes for the freelancer of this job  |



## Functions

### setPayment
set Payment contract address. Only owner can invoke.

---
 function setPayment(address p) onlyOwner public

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `p`       | address       | address of the payment contract |

modifier: [onlyOwner](../../src/contracts/zeppelin/ownership/Ownable.sol#L31-L35)


### isAgaintsPoll
Check this Poll started for the job Hash has againts or not

---
function isAgaintsPoll(bytes jobHash) public constant returns(bool)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes       |  Hash of the job store on IPFS  |

Return: (Bool)

### startPoll
Create a Poll to start Dispute by provide the evident proofHash

---
function startPoll(bytes jobHash, bytes proofHash) public 

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes       |  Hash of the job stored on IPFS  |
| `proofHash`       | bytes       |  Hash of the job evident stored on IPFS  |

### againstPoll
Against a Poll to start Dispute by provide the evident proofHash. 

---
function againstPoll(bytes jobHash, bytes againstProofHash) public 

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes       |  Hash of the job stored on IPFS  |
| `againstProofHash`       | bytes       |  Hash of the job evident stored on IPFS  |

### getPoll
Get Poll detail

---
function getPoll(bytes jobHash) public constant returns (uint256, uint256, bool)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes       |  Hash of the job stored on IPFS  |

Returns:

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobOwnerVotes`       | uint256       |  number of votes for the hirer of this job  |
| `freelancerVotes`       | uint256       |  number of votes for the freelancer of this job  |


### finalizePoll
Finalize a Poll

---
function finalizePoll(bytes jobHash) public

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes       |  Hash of the job stored on IPFS  |

