const BBParams =  artifacts.require("BBParams");
const BBDispute =  artifacts.require("BBDispute");
const BBVoting =  artifacts.require("BBVoting");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");


module.exports = async function(deployer) {

   if(deployer.network_id == 3){

     proxyAddressParams = '0x2866cef47dce5db897678695d08f0633102f164a';
     proxyAddressDispute = '0xdeeaaad9a5f7c63fd2a29db1c9d522b056637b28';
     proxyAddressVoting = '0x347d3adf5081718020d11a2add2a52b39ad9971a';
      // create bb contract
     let params = await BBParams.deployed();
     let dispute = await BBDispute.deployed();
     let voting = await BBVoting.deployed();

     await AdminUpgradeabilityProxy.at(proxyAddressParams).upgradeTo(params.address);
     await AdminUpgradeabilityProxy.at(proxyAddressDispute).upgradeTo(dispute.address);
     await AdminUpgradeabilityProxy.at(proxyAddressVoting).upgradeTo(voting.address);

     return true;
     console.log('done');
   }  
};
