const BBDispute =  artifacts.require("BBDispute");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
const BBFreelancerPayment =  artifacts.require("BBFreelancerPayment");
var Web3 = require('web3');

module.exports = async function(deployer) {
// 	if(deployer.network_id == 3){
// 	var proxyAddressPayment = '0x253f112b946a72a008343d5bccd14e04288ca45c'
// 	await BBFreelancerPayment.at(proxyAddressPayment).addToken('0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeebb0', true)
//   //let BBUnOrderedTCR = '0x2f700e71786b95d3469a27073974689a5772fa8b'
//   // return  AdminUpgradeabilityProxy.at('0x2b44a5589e8b3cd106a7542d4af9c5eb0016ef6e').upgradeTo('0xe27d904dfde3bd3e2fd4d388081f4dec916cf085');
//   // let votingI = await BBVoting.at('0x347d3adf5081718020d11a2add2a52b39ad9971a');
//   // let a = await votingI.calcReward('QmbhX9KkRYtoHAUPCyrYprtAp46xvfs8ZPqJHoDw15jg16');
//   // console.log(a);
//   // let b = await votingI.claimReward('QmbhX9KkRYtoHAUPCyrYprtAp46xvfs8ZPqJHoDw15jg16');
// //  return deployer.deploy(BBDispute);
// }
	//   let payment =await BBFreelancerPayment.at('0x253f112b946a72a008343d5bccd14e04288ca45c')
	// console.log(payment)
	//  console.log(BBFreelancerPayment.abi)
	// console.log(payment.methods.deposit(1, '0x1d893910d30edc1281d97aecfe10aefeabe0c41b', 100e18).encodeABI());
	// var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

	// var myContract = new web3.eth.Contract(BBFreelancerPayment.abi);
	// console.log(myContract.methods.deposit(1, '0x1d893910d30edc1281d97aecfe10aefeabe0c41b',  web3.utils.toWei('100','ether')).encodeABI());

}