
# BBVoting

Contract **BBRating** is *BBStandard* 

imports: [BBStandard.sol](../../src/contracts/BBStandard.sol), [BBRatingInterface.sol](../../src/contracts/BBRatingInterface.sol)

Source: [BBRating.sol](../../src/contracts/BBRating.sol)

BBRating is the contract allow user can rate something in another contract


  * [Events](#events)
     * [Rating](#rating)
  * [Implement](#implement)
     * [allowRating](#allowRating)
  * [Functions](#functions)
     * [rate](#rate)
   
## Events

### Rating
Event for logging data of rating.

---
    event Rating(uint indexed key, uint256 relatedTo,  address indexed rateTo,uint256 totalStar, uint256 totalUser ,uint256 star, bytes commentHash);

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `key`       | uint       |  key of relatedAddress using  BBVoting contract |
| `relatedTo`       | uint256   | id of to rate|
| `whoRate` | address | address of user rate this |
|`rateTo`| address |address of rating|
|`totalStar`|uint256| totol star for address  |
|`totalUser`| uint256 | total user rate  address|
|`star`| uint256| value of rating of user (1 - 5)|
|`commentHash`|bytes |Hash of the comment store on IPFS|

---

## Implement

### allowRating

function allowRating(address relatedAddr, address  rateTo, uint256 relatedTo) private returns(bool)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `relatedAddr`       | address       |  address of contract implement this function|
|`rateTo`| address |address of rating|
| `relatedTo`       | uint256   | id of to rate|

Implementation: [public](../../src/contracts/BBFreelancerJob.sol#L137-L155)


## Functions

### rate
do Rating
---
function rate(uint key, address rateTo, uint256 relatedTo, uint value, bytes commentHash) public

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `key`       | uint       |  key of relatedAddress contract|
|`rateTo` | address | rate to adress in contract |
|`relatedTo`|uint256| rate to ID in contract |
|`value` | uint | value of rating |
|`commentHash`| bytes |Hash of the comment store on IPFS|


