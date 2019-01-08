pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBLib.sol';


contract BBWrapMainChain is BBStandard {

    mapping(bytes32 => bool)  private admins;

    event AdminAdded(address indexed admin, bool add);
    event DepositEther(address indexed sender, uint256 value);
    event WithDrawal(address indexed receiver, uint256 value);

    /// @dev Only allow access from the latest version of a contract in the network after deployment
    modifier onlyAdmin() {
        // // The owner is only allowed to set the storage upon deployment to register the initial contracts, afterwards their direct access is disabled
        require(admins[keccak256(abi.encodePacked('admin:',msg.sender))] == true);
        _;
    }

     /**
     * @dev 
     * @param admin Admin of the contract
     * @param add is true/false
     */
    function addAdmin(address admin, bool add) public onlyOwner {
        require(admin!=address(0x0));
        admins[keccak256(abi.encodePacked('admin:',admin))] = add;
        emit AdminAdded(admin, add);
    }

    function () payable {

        require(msg.value > 0);
        uint256 lastDepost = bbs.getUint(BBLib.toB32(msg.sender ,'ETHER'));
        //update new balance sender in contract
        lastDepost = lastDepost.add(msg.value);
        bbs.setUint(BBLib.toB32(msg.sender ,'ETHER'),lastDepost);

        emit DepositEther(msg.sender, msg.value);
    }

    function getBalance(address userAddress)  public view returns (uint256) {

        return  bbs.getUint(BBLib.toB32(userAddress ,'ETHER'));
        
    }

    function withDrawal(address receiverAddress) public onlyAdmin {

         require(receiverAddress != address(0x0));
         uint256 lastDepost = bbs.getUint(BBLib.toB32(receiverAddress ,'ETHER'));
         require(lastDepost > 0);
         bbs.setUint(BBLib.toB32(msg.sender ,'ETHER'),0);
         receiverAddress.transfer(lastDepost);
   
         emit WithDrawal(receiverAddress,lastDepost);
    }

    
}