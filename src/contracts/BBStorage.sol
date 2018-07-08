pragma solidity 0.4.24;

import "./zeppelin/ownership/Ownable.sol";


contract BBStorage is Ownable {


    /**** Storage Types *******/

    mapping(bytes32 => uint256)    private uIntStorage;
    mapping(bytes32 => string)     private stringStorage;
    mapping(bytes32 => address)    private addressStorage;
    mapping(bytes32 => bytes)      private bytesStorage;
    mapping(bytes32 => bool)       private boolStorage;
    mapping(bytes32 => int256)     private intStorage;


    /*** Modifiers ************/

    /// @dev Only allow access from the latest version of a contract in the network after deployment
    modifier onlyLatestContract() {
        // The owner is only allowed to set the storage upon deployment to register the initial contracts, afterwards their direct access is disabled
        //TODO
        _;
    }

    /**** Get Methods ***********/

    /// @param _key The key for the record
    function getAddress(bytes32 _key) external view returns (address) {
        return addressStorage[_key];
    }

    /// @param _key The key for the record
    function getUint(bytes32 _key) external view returns (uint) {
        return uIntStorage[_key];
    }

    /// @param _key The key for the record
    function getString(bytes32 _key) external view returns (string) {
        return stringStorage[_key];
    }

    /// @param _key The key for the record
    function getBytes(bytes32 _key) external view returns (bytes) {
        return bytesStorage[_key];
    }

    /// @param _key The key for the record
    function getBool(bytes32 _key) external view returns (bool) {
        return boolStorage[_key];
    }

    /// @param _key The key for the record
    function getInt(bytes32 _key) external view returns (int) {
        return intStorage[_key];
    }


    /**** Set Methods ***********/


    /// @param _key The key for the record
    function setAddress(bytes32 _key, address _value) onlyLatestContract external {
        addressStorage[_key] = _value;
    }

    /// @param _key The key for the record
    function setUint(bytes32 _key, uint _value) onlyLatestContract external {
        uIntStorage[_key] = _value;
    }

    /// @param _key The key for the record
    function setString(bytes32 _key, string _value) onlyLatestContract external {
        stringStorage[_key] = _value;
    }

    /// @param _key The key for the record
    function setBytes(bytes32 _key, bytes _value) onlyLatestContract external {
        bytesStorage[_key] = _value;
    }
    
    /// @param _key The key for the record
    function setBool(bytes32 _key, bool _value) onlyLatestContract external {
        boolStorage[_key] = _value;
    }
    
    /// @param _key The key for the record
    function setInt(bytes32 _key, int _value) onlyLatestContract external {
        intStorage[_key] = _value;
    }


    /**** Delete Methods ***********/
    
    /// @param _key The key for the record
    function deleteAddress(bytes32 _key) onlyLatestContract external {
        delete addressStorage[_key];
    }

    /// @param _key The key for the record
    function deleteUint(bytes32 _key) onlyLatestContract external {
        delete uIntStorage[_key];
    }

    /// @param _key The key for the record
    function deleteString(bytes32 _key) onlyLatestContract external {
        delete stringStorage[_key];
    }

    /// @param _key The key for the record
    function deleteBytes(bytes32 _key) onlyLatestContract external {
        delete bytesStorage[_key];
    }
    
    /// @param _key The key for the record
    function deleteBool(bytes32 _key) onlyLatestContract external {
        delete boolStorage[_key];
    }
    
    /// @param _key The key for the record
    function deleteInt(bytes32 _key) onlyLatestContract external {
        delete intStorage[_key];
    }

}