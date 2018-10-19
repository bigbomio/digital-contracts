# BBFreelancer

Contract **BBFreelancer** is *BBStandard* 

imports: [BBStandard.sol](../../src/contracts/BBStandard.sol)

Source: [BBFreelancer.sol](../../src/contracts/BBFreelancer.sol)

BBFreelancer is modifiers contract used for `BBFreelancerBid`, `BBFreelancerJob`, `BBFreelancerPayment`


  * [Modifiers](#modifiers)
     * [jobNotExist](#jobnotexist)
     * [isFreelancerOfJob](#isfreelancerofjob)
     * [isNotOwnerJob](#isnotownerjob)
     * [isOwnerJob](#isownerjob)
     * [isNotCanceled](#isnotcanceled)
     * [jobNotStarted](#jobnotstarted)


## Modifiers

### jobNotExist
Require job hash not exist in BBFreelancer System

---

modifier jobNotExist(bytes jobHash)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes       | Hash of job stored in IPFS |

### isFreelancerOfJob
Require the sender is the freelancer of this `Job ID`

---

modifier isFreelancerOfJob(bytes jobHash)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       | ID of Job |

### isNotOwnerJob
Require the sender is not the owner of this `Job ID`

---

modifier isNotOwnerJob(unit256 jobID)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       | ID of Job |

### isOwnerJob
Require the sender is the owner of this `Job ID`

---

modifier isOwnerJob(unit256 jobID)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       | ID of Job |

### isNotCanceled
Require this `Job ID` is not canceled yet

---

modifier isNotCanceled(jobID uint256)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       | ID of Job |


### jobNotStarted
Require this `Job ID` is not started yet

---

modifier jobNotStarted(bytes uint256)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256       | ID of Job |


