# BBDispute

Contract **BBDispute** is *BBStandard* 

imports: [BBStandard.sol](../../src/contracts/BBStandard.sol), [BBLib.sol](../../src/contracts/BBLib.sol), [BBFreelancerPayment.sol](../../src/contracts/BBFreelancerPayment.sol)

Source: [BBDispute.sol](../../src/contracts/BBDispute.sol)

BBDispute is the contract implements Poll creation actions for creating dispute in Freelancer app

  * [Events](#events)
     * [PollStarted](#pollstarted)
     * [PollAgainsted](#pollagainsted)
     * [PollFinalized](#pollfinalized)
     * [PollWhiteFlaged](#pollwhiteflaged)
     * [PollExtended](#pollextended)
  * [Functions](#functions)
     * [setPayment](#setpayment)
     * [isAgaintsPoll](#isagaintspoll)
     * [startPoll](#startpoll)
     * [againstPoll](#againstpoll)
     * [getPoll](#getpoll)
     * [finalizePoll](#finalizepoll)
     * [whiteflagPoll](#whiteflagpoll)
     * [extendPoll](#extendpoll)


## Events

### PollStarted
Event for logging start new poll.

---
event PollStarted(uint256 jobID, address indexed creator);

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job  |
| `proofHash`     | proofHash   |  Hash of the job evident stored on IPFS |
| `creator`       | address       |  address who start the Poll  |

### PollAgainsted
Event for logging against the exist poll.

---
event PollAgainsted(uint256 jobID, address indexed creator);

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job  |
| `proofHash`     | proofHash  |  Hash of the job evident stored on IPFS |
| `creator`       | address       |  address who against the Poll  |


### PollFinalized
Event for logging against the exist poll.

---
event PollFinalized(uint256 jobID, uint256 jobOwnerVotes, uint256 freelancerVotes, bool isPass);

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job  |
| `jobOwnerVotes`       | uint256       |  number of votes for the hirer of this job  |
| `freelancerVotes`       | uint256       |  number of votes for the freelancer of this job  |

### PollWhiteFlaged
Event for logging White-Flaged.

---
event PollWhiteFlaged(uint256 indexed jobID, address indexed creator);


| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job  |
| `creator`       | address       |  who fire white-flag a dispute  |


### PollExtended
Event for logging Extend a Voting duration.

---
event PollExtended(uinit56 indexed jobID);


| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job  |



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
function isAgaintsPoll(uint256 jobID) public constant returns(bool)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job  |

Return: (Bool)

### startPoll
Create a Poll to start Dispute by provide the evident proofHash

---
function startPoll(uint256 jobID, bytes proofHash) public 

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job  |
| `proofHash`       | bytes       |  Hash of the job evident stored on IPFS  |

### againstPoll
Against a Poll to start Dispute by provide the evident proofHash. 

---
function againstPoll(unit256 jobID, bytes againstProofHash) public 

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job  |
| `againstProofHash`       | bytes       |  Hash of the job evident stored on IPFS  |

### getPoll
Get Poll detail

---
function getPoll(uint256 jobID) public constant returns (uint256, uint256, bool)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job  |

Returns:

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobOwnerVotes`       | uint256       |  number of votes for the hirer of this job  |
| `freelancerVotes`       | uint256       |  number of votes for the freelancer of this job  |


### finalizePoll
Finalize a Poll

---
function finalizePoll(uint256 jobID) public

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job  |


### whiteflagPoll
White-flag a Poll

---
function whiteflagPoll(uint256 jobID) public

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job  |


### extendPoll
Extend a Poll

---
function extendPoll(uint256 jobID) public

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       |  ID of job  |



