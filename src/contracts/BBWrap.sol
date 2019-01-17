pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBLib.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol';

contract BBWrap is BBStandard {

    mapping(bytes32 => bool)  private admins;

    event AdminAdded(address indexed admin, bool add);
    event DepositEther(address indexed sender, uint256 value);
    event Withdrawal(address indexed receiver, address indexed token, uint256 value);
    event SetToken(address token, bytes key);
    event MintToken(address indexed receiverAddress, address indexed token, uint256 value, bytes txHash);
    event DepositToken(address indexed sender, address indexed token, uint256 value);

    address constant ETH_TOKEN_ADDRESS = address(0x00eEeEEEeEEeEEEeEeeeEeEEeeEeeeeEEEeEEbb0);

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

    //Set Token in side-chain
    function setToken(address tokenAddress, bytes key) public onlyAdmin {
        require(tokenAddress != address(0x0));
        bbs.setAddress(BBLib.toB32('TOKEN', key), tokenAddress);

        emit SetToken(tokenAddress, key);
    }

    //Operator mint token to user in side-chain after user depost ether / erc20 token to contract in mainet
    function mintToken(address receiverAddress, uint256 value, bytes key ,bytes txHash) public onlyAdmin {
        bool isMintToken = bbs.getBool(BBLib.toB32('MINT',txHash));
        require(isMintToken == false);
        require(receiverAddress != address(0x0));
        address tokenAddress = bbs.getAddress(BBLib.toB32('TOKEN', key));
        require(tokenAddress != address(0x0));

        bbs.setBool(BBLib.toB32('MINT',txHash), true);
        require(ERC20Mintable(tokenAddress).mint(receiverAddress, value));

        emit MintToken(receiverAddress, tokenAddress, value, txHash);
    }

    //User depost token in side-chain or mainnet to get back ether / token in mainnet or mint token in side-chain
    function depositToken(address tokenAddress, uint256 value) public {
        require(tokenAddress != address(0x0));
        require(value  > 0);
        require(ERC20(tokenAddress).transferFrom(msg.sender, address(this), value));

        emit DepositToken(msg.sender, tokenAddress, value);
    }


    //User deposit ether to contract in mainnet
    function () payable {

        require(msg.value > 0);

        emit DepositEther(msg.sender, msg.value);
    }


    //Operator send back ether / erc20 token to user in mainet
    function doWithdrawal(address receiverAddress, address tokenAddress, uint256 value, bytes txHash) public onlyAdmin {
         bool isWithdrawal = bbs.getBool(BBLib.toB32('WD',txHash));
         require(isWithdrawal == false);
         require(receiverAddress != address(0x0));
         require(tokenAddress != address(0x0));
         require(value > 0);
         bbs.setBool(BBLib.toB32('WD',txHash), true);
         if(tokenAddress==ETH_TOKEN_ADDRESS){
            receiverAddress.transfer(value);
         } else {
            require(ERC20(tokenAddress).transfer(receiverAddress, value));

         }
         emit Withdrawal(receiverAddress, tokenAddress, value);
    }

    
}