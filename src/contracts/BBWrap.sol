pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBLib.sol';
import './zeppelin/token/ERC20/ERC20.sol';


contract BBWrap is BBStandard {

    mapping(bytes32 => bool)  private admins;

    event AdminAdded(address indexed admin, bool add);
    event DepositEther(address indexed sender, uint256 value);
    event WithDrawal(address indexed receiver, address indexed token, uint256 value);
    event SetTokenSideChain(address token, bytes key);
    event MintTokenSideChain(address indexed receiverAddress, address indexed token, uint256 value, bytes txHash);
    event DepositTokenSideChain(address indexed sender, address indexed token, uint256 value);

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

    function setToken(address tokenAddress, bytes key) public onlyAdmin {
        require(tokenAddress != address(0x0));
        bbs.setAddress(BBLib.toB32('TOKEN', key), tokenAddress);

        emit SetTokenSideChain(tokenAddress, key);
    }

    //Operator mint token to user in side-chain after user depost ether / erc20 token to contract in mainet
    function mintToken(address receiverAddress, uint256 value, bytes key ,bytes txHash) public onlyAdmin {

        require(receiverAddress != address(0x0));
        address tokenAddress = bbs.getAddress(BBLib.toB32('TOKEN', key));
        require(tokenAddress != address(0x0));
        ERC20 token = ERC20(tokenAddress);
        require(token.transfer(receiverAddress, value));

        emit MintTokenSideChain(receiverAddress, tokenAddress, value, txHash);
    }

    //User depost token in side-chain to get back ether / token in mainnet
    function depositToken(address tokenAddress, uint256 value) public {
        require(tokenAddress != address(0x0));
        ERC20 token = ERC20(tokenAddress);
        require(token.transferFrom(msg.sender, address(this), value));

        emit DepositTokenSideChain(msg.sender, tokenAddress, value);
    }


    //User deposit ether to contract in mainnet
    function () payable {

        require(msg.value > 0);

        emit DepositEther(msg.sender, msg.value);
    }

    function getBalance(address userAddress)  public view returns (uint256) {

        return  bbs.getUint(BBLib.toB32(userAddress ,'ETHER'));
        
    }

    //Operator send back ether / erc20 token to user in mainet
    function withDrawal(address receiverAddress, address tokenAddress, uint256 value) public onlyAdmin {

         require(receiverAddress != address(0x0));
         require(tokenAddress != address(0x0));
         require(value > 0);
         if(tokenAddress==ETH_TOKEN_ADDRESS){
            receiverAddress.transfer(value);
         }
   
         emit WithDrawal(receiverAddress, tokenAddress, value);
    }

    
}