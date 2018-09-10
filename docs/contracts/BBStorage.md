# BBStorage

Contract **BBStorage** is *Ownable* 

imports: [Ownable.sol](../../src/contracts/zeppelin/ownership/Ownable.sol)

Source: [BBStorage.sol](../../src/contracts/BBStorage.sol)

BBStorage is key-value type storage:

```javascript
    mapping(bytes32 => uint256)    private uIntStorage;
    mapping(bytes32 => string)     private stringStorage;
    mapping(bytes32 => address)    private addressStorage;
    mapping(bytes32 => bytes)      private bytesStorage;
    mapping(bytes32 => bool)       private boolStorage;
    mapping(bytes32 => int256)     private intStorage;
```

Index
=================
  * [Modifiers](#modifiers)
     * [onlyAdminStorage](#onlyadminstorage)
  * [Events](#events)
     * [AdminAdded](#adminadded)
  * [Functions](#functions)
     * [addAdmin](#addadmin)
     * [getAddress](#getaddress)
     * [getUint](#getuint)
     * [getString](#getstring)
     * [getBytes](#getbytes)
     * [getBool](#getbool)
     * [getInt](#getint)
     * [setAddress](#setaddress)
     * [setUint](#setuint)
     * [setString](#setstring)
     * [setBytes](#setbytes)
     * [setBool](#setbool)
     * [setInt](#setint)
     * [deleteAddress](#deleteaddress)
     * [deleteUint](#deleteuint)
     * [deleteString](#deletestring)
     * [deleteBytes](#deletebytes)
     * [deleteBool](#deletebool)
     * [deleteInt](#deleteint)


## Modifiers

### onlyAdminStorage
Only allow access from the admin storage mapping, use for write/delete data

---
modifier onlyAdminStorage()



## Events

### AdminAdded
Event for logging admin additions or removals from the storage contract.

---
event AdminAdded(address indexed admin, bool add)

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `admin`       | address       | address can write/edit data |
| `add`         | bool          |  `true` if admin was successfully added, `false` to removed|

## Functions

### addAdmin
add/delete admin to allow write/delete storage object. Only owner can invoke.

---
function addAdmin(address admin, bool add) public onlyOwner

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `admin`       | address       | address can write/edit data |
| `add`         | bool          |  `true` to add, `false` to remove              |

modifier: [onlyOwner](../../src/contracts/zeppelin/ownership/Ownable.sol#L31-L35)

### getAddress
Get `address` value from storage mapping by key

---
`function getAddress(bytes32 _key) external view returns (address)`

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key |

Returns: `address` value

### getUint
Get `uint256` value from storage mapping by key

---
`function getUint(bytes32 _key) external view returns (uint256)`

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key |

Returns: `uint256` value

### getString
Get `string` value from storage mapping by key

---
`function getString(bytes32 _key) external view returns (string)`

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key |

Returns: `string` value

### getBytes
Get `bytes` value from storage mapping by key

---
`function getBytes(bytes32 _key) external view returns (bytes)`

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key |

Returns: `bytes` value

### getBool
Get `bool` value from storage mapping by key

---
`function getBool(bytes32 _key) external view returns (bool)`

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key |

Returns: `bool` value

### getInt
Get `int` value from storage mapping by key

---
`function getInt(bytes32 _key) external view returns (int)`

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key |

Returns: `int` value

### setAddress
Set `address` value to storage mapping by key

---
`function setAddress(bytes32 _key, address _value) onlyAdminStorage external `

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key |
| `_value`       | address       | address value |

Modifier: `onlyAdminStorage`

### setUint
Set `uint256` value to storage mapping by key

---
`function setUint(bytes32 _key, uint256 _value) onlyAdminStorage external `

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key |
| `_value`       | uint256       | uint256 value |

Modifier: `onlyAdminStorage`

### setString
Set `string` value to storage mapping by key

---
`function setString(bytes32 _key, string _value) onlyAdminStorage external `

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key |
| `_value`       | string       | string value |

Modifier: `onlyAdminStorage`

### setBytes
Set `bytes` value to storage mapping by key

---
`function setBytes(bytes32 _key, bytes _value) onlyAdminStorage external `

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key |
| `_value`       | bytes       | bytes value |

Modifier: `onlyAdminStorage`

### setBool
Set `bool` value to storage mapping by key

---
`function setBool(bytes32 _key, bool _value) onlyAdminStorage external `

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key |
| `_value`       | bool       | bool value |

Modifier: `onlyAdminStorage`

### setInt
Set `int` value to storage mapping by key

---
`function setInt(bytes32 _key, int _value) onlyAdminStorage external `

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key |
| `_value`       | int       | int value |

Modifier: `onlyAdminStorage`

### deleteAddress
delete `address` value from storage mapping by key

---
`function deleteAddress(bytes32 _key) onlyAdminStorage external`

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key to delete |

Modifier: `onlyAdminStorage`

### deleteUint
delete `unit256` value from storage mapping by key

---
`function deleteUint(bytes32 _key) onlyAdminStorage external`

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key to delete |

Modifier: `onlyAdminStorage`

### deleteString
delete `string` value from storage mapping by key

---
`function deleteString(bytes32 _key) onlyAdminStorage external`

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key to delete |

Modifier: `onlyAdminStorage`

### deleteBytes
delete `bytes` value from storage mapping by key

---
`function deleteBytes(bytes32 _key) onlyAdminStorage external`

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key to delete |

Modifier: `onlyAdminStorage`

### deleteBool
delete `bool` value from storage mapping by key

---
`function deleteBool(bytes32 _key) onlyAdminStorage external`

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key to delete |

Modifier: `onlyAdminStorage`

### deleteInt
delete `int` value from storage mapping by key

---
`function deleteInt(bytes32 _key) onlyAdminStorage external`

| Parameter     | Type          | Description                 |
| ------------- |:-------------:| ---------------------------:|
| `_key`       | bytes32       | hash `keccak256` of the key to delete |

Modifier: `onlyAdminStorage`


