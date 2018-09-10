# BBStandard

Contract **BBStandard** is *Ownable* 

imports: [Ownable.sol](../../src/contracts/zeppelin/ownership/Ownable.sol), [SafeMath.sol](../../src/contracts/zeppelin/math/SafeMath.sol), [BBStorage.sol](../../src/contracts/BBStorage.sol), [ERC20.sol](../../src/contracts/zeppelin/token/ERC20/ERC20.sol)

Source: [BBStandard.sol](../../src/contracts/BBStandard.sol)

BBStandard is standard contract implements the key-value storage from `BBStorage`, and use `BBO ERC20` token for payment

Index
=================

   * [BBStandard](#bbstandard)
      * [Functions](#functions)
         * [setStorage](#setstorage)
         * [setBBO](#setbbo)
         * [withdrawTokens](#withdrawtokens)


## Functions

### setStorage
set Storage contract address. Only owner can invoke.

---
function setStorage(address storageAddress) onlyOwner public

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `storageAddress`       | address       | address of the storage contract |

modifier: [onlyOwner](../../src/contracts/zeppelin/ownership/Ownable.sol#L31-L35)


### setBBO
set BBO token contract address. Only owner can invoke.

---
function setBBO(address BBOAddress) onlyOwner public

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `BBOAddress`       | address       | address of the BBO token contract |

modifier: [onlyOwner](../../src/contracts/zeppelin/ownership/Ownable.sol#L31-L35)

### withdrawTokens
withdraw any token in the contract. Only owner can invoke.

---
function withdrawTokens(ERC20 anyToken) public onlyOwner

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `anyToken`       | ERC20       | address of the token |

modifier: [onlyOwner](../../src/contracts/zeppelin/ownership/Ownable.sol#L31-L35)

