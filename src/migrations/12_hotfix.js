const BBDispute =  artifacts.require("BBDispute");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
const BBStorage = artifacts.require("BBStorage");
const BBFreelancerPayment = artifacts.require("BBFreelancerPayment");

module.exports = async function(deployer) {
	return deployer.then(async function(){
		await BBStorage.at('0xb83d8faa19b3bd03d200e4eb9f985ac247497726').addAdmin('0xda452218a3c7521f7de4aa1a1e9411998d77e468', true);
		// await BBFreelancerPayment.at('0xf5cf17e2059b78ca9012475309c296c4e6c8a79c').addToken('0x1d893910d30edc1281d97aecfe10aefeabe0c41b', true);
		// await BBFreelancerPayment.at('0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeebb0').addToken('0x1d893910d30edc1281d97aecfe10aefeabe0c41b', true);
		
	});
  //let BBUnOrderedTCR = '0x2f700e71786b95d3469a27073974689a5772fa8b'
  // return  AdminUpgradeabilityProxy.at('0x2b44a5589e8b3cd106a7542d4af9c5eb0016ef6e').upgradeTo('0xe27d904dfde3bd3e2fd4d388081f4dec916cf085');
  // let votingI = await BBVoting.at('0x347d3adf5081718020d11a2add2a52b39ad9971a');
  // let a = await votingI.calcReward('QmbhX9KkRYtoHAUPCyrYprtAp46xvfs8ZPqJHoDw15jg16');
  // console.log(a);
  // let b = await votingI.claimReward('QmbhX9KkRYtoHAUPCyrYprtAp46xvfs8ZPqJHoDw15jg16');
//  return deployer.deploy(BBDispute);
}