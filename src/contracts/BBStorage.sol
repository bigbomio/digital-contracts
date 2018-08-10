/**
 * Created on 2018-08-10 14:58
 * @summary: A general-purpose key-value smart contract
 * @author: Chris Nguyen
 */
pragma solidity 0.4.24;

import "./zeppelin/ownership/Ownable.sol";


/**
 * @title: Key-Value contract
 */
contract BBStorage is Ownable {


    /**** Storage Types *******/

    mapping(bytes32 => uint256)    private uIntStorage;
    mapping(bytes32 => string)     private stringStorage;
    mapping(bytes32 => address)    private addressStorage;
    mapping(bytes32 => bytes)      private bytesStorage;
    mapping(bytes32 => bool)       private boolStorage;
    mapping(bytes32 => int256)     private intStorage;
    mapping(bytes32 => bool)       private admins;


    /*** Modifiers ************/
   
    /// @dev Only allow access from the latest version of a contract in the network after deployment
    modifier onlyAdminStorage() {
        // // The owner is only allowed to set the storage upon deployment to register the initial contracts, afterwards their direct access is disabled
        require(admins[keccak256(abi.encodePacked('admin:',msg.sender))] == true);
        _;
    }

    /**
     * @dev: 
     * @param adm
     */
    function addAdmin(address adm) public onlyOwner {
        require(adm!=address(0x0));
        require(admins[keccak256(abi.encodePacked('admin:',adm))]!=true);

        admins[keccak256(abi.encodePacked('admin:',adm))] = true;
    }
    /**
     * @dev: 
     * @param adm
     */
    function removeAdmin(address adm) public onlyOwner {
        require(adm!=address(0x0));
        require(admins[keccak256(abi.encodePacked('admin:',adm))]==true);

        admins[keccak256(abi.encodePacked('admin:',adm))] = false;
    }

    /**** Get Methods ***********/

    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     */
    function getAddress(bytes32 _key) external view returns (address) {
        return addressStorage[_key];
    }

    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     */
    function getUint(bytes32 _key) external view returns (uint) {
        return uIntStorage[_key];
    }

    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     */
    function getString(bytes32 _key) external view returns (string) {
        return stringStorage[_key];
    }

    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     */
    function getBytes(bytes32 _key) external view returns (bytes) {
        return bytesStorage[_key];
    }

    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     */
    function getBool(bytes32 _key) external view returns (bool) {
        return boolStorage[_key];
    }

    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     */
    function getInt(bytes32 _key) external view returns (int) {
        return intStorage[_key];
    }


    /**** Set Methods ***********/


    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     * @param _value
     */
    function setAddress(bytes32 _key, address _value) onlyAdminStorage external {
        addressStorage[_key] = _value;
    }

    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     * @param _value
     */
    function setUint(bytes32 _key, uint _value) onlyAdminStorage external {
        uIntStorage[_key] = _value;
    }

    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     * @param _value
     */
    function setString(bytes32 _key, string _value) onlyAdminStorage external {
        stringStorage[_key] = _value;
    }

    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     * @param _value
     */
    function setBytes(bytes32 _key, bytes _value) onlyAdminStorage external {
        bytesStorage[_key] = _value;
    }
    
    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     * @param _value
     */
    function setBool(bytes32 _key, bool _value) onlyAdminStorage external {
        boolStorage[_key] = _value;
    }
    
    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     * @param _value
     */
    function setInt(bytes32 _key, int _value) onlyAdminStorage external {
        intStorage[_key] = _value;
    }


    /**** Delete Methods ***********/
    
    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     */
    function deleteAddress(bytes32 _key) onlyAdminStorage external {
        delete addressStorage[_key];
    }

    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     */
    function deleteUint(bytes32 _key) onlyAdminStorage external {
        delete uIntStorage[_key];
    }

    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     */
    function deleteString(bytes32 _key) onlyAdminStorage external {
        delete stringStorage[_key];
    }

    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     */
    function deleteBytes(bytes32 _key) onlyAdminStorage external {
        delete bytesStorage[_key];
    }
    
    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     */
    function deleteBool(bytes32 _key) onlyAdminStorage external {
        delete boolStorage[_key];
    }
    
    /// @param _key The key for the record
    /**
     * @dev: 
     * @param _key
     */
    function deleteInt(bytes32 _key) onlyAdminStorage external {
        delete intStorage[_key];
    }

}