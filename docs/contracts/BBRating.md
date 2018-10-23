
# BBVoting

Contract **BBRating** is *BBStandard* 

imports: [BBStandard.sol](../../src/contracts/BBStandard.sol), [BBLib.sol](../../src/contracts/BBLib.sol)

Source: [BBRating.sol](../../src/contracts/BBRating.sol)

BBRating is the contract allow user can rate something in another contract


  * [Events](#events)
     * [Rating](#rating)
  * [Functions](#functions)
     * [rate](#rate)
     * [allowRating](#allowRating)
   
## Events

### Rating
Event for logging data of rating.

---
    event Rating(uint256 jobID, address whoRate ,address indexed rateToAddress,uint256 totalStar, uint256 totalUser ,uint256 star, bytes commentHash);

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `jobID`       | uint256   | id of Job|
| `whoRate` | address | address of user rate this |
|`rateToAddress`| address |address of rating|
|`totalStar`|uint256| total star for address  |
|`totalUser`| uint256 | total user rate  address|
|`star`| uint256| value rating of user (1 - 5)|
|`commentHash`|bytes |Hash of the comment store on IPFS|

---





## Functions

### rate
do Rating
---
function rate(address rateToAddress, uint256 jobID, uint256 value, bytes commentHash) public

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
|`rateToAddress` | address | rate to adress in contract |
|`jobID`|uint256| ID of job |
|`value` | uint | value of rating |
|`commentHash`| bytes |Hash of the comment store on IPFS|

### allowRating

function allowRating(address sender, address rateToAddress, uint256 jobID) private returns(bool)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `sender`       | address       |  address of user rate this|
|`rateToAddress`| address |address of rating|
| `jobID`       | uint256   | ID of job|

