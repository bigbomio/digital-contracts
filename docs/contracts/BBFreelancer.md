# BBFreelancer

Contract **BBFreelancer** is *BBStandard* 

imports: [BBStandard.sol](../../src/contracts/BBStandard.sol)

Source: [BBFreelancer.sol](../../src/contracts/BBFreelancer.sol)

BBFreelancer is modifiers contract used for `BBFreelancerBid`, `BBFreelancerJob`, `BBFreelancerPayment`

Index
=================

   * [BBFreelancer](#bbfreelancer)
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
Require the sender is the freelancer of this `Job Hash`

---

modifier isFreelancerOfJob(bytes jobHash)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes       | Hash of job stored in IPFS |

### isNotOwnerJob
Require the sender is not the owner of this `Job Hash`

---

modifier isNotOwnerJob(bytes jobHash)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes       | Hash of job stored in IPFS |

### isOwnerJob
Require the sender is the owner of this `Job Hash`

---

modifier isOwnerJob(bytes jobHash)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes       | Hash of job stored in IPFS |

### isNotCanceled
Require this `Job Hash` is not canceled yet

---

modifier isNotCanceled(bytes jobHash)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes       | Hash of job stored in IPFS |


### jobNotStarted
Require this `Job Hash` is not started yet

---

modifier jobNotStarted(bytes jobHash)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobHash`       | bytes       | Hash of job stored in IPFS |


