const BBParams =  artifacts.require("BBParams");
const BBDispute =  artifacts.require("BBDispute");
const BBVoting =  artifacts.require("BBVoting");
const BBVotingHelper =  artifacts.require("BBVotingHelper");
const BBStorage =  artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");

module.exports = async function(deployer) {

   if(deployer.network_id == 3){
     var proxyAddressJob = '0xb1e878028d0e3e47c803cbb9d1684d9d3d72a1b1'
     var proxyAddressBid = '0x7b388ecfec2f5f706aa34b540a39e8c434cfc8b4'
     var proxyAddressPayment = '0x253f112b946a72a008343d5bccd14e04288ca45c'
     var storageAddress = '0x99a2c9bc3793cc72a7a9b352e97deece4f4961c7'
     var proxyFactAddress = '0xac141d2fa2740bd57e5c035a811b6fb6cceb4b71'

    // var paramsProxy = '0x2866cef47dce5db897678695d08f0633102f164a'
    // var disputeProxy = '0xdeeaaad9a5f7c63fd2a29db1c9d522b056637b28'
    // var votingProxy = '0x347d3adf5081718020d11a2add2a52b39ad9971a'


     var params, dispute, voting, votingHelper, paramsProxy, disputeProxy, votingProxy, votingHelperProxy;
      // create bb contract
     return deployer.deploy(BBParams).then(function (rs) {
        params = rs;
        return deployer.deploy(BBDispute);
     }).then(function(rs){
        dispute = rs;
        return deployer.deploy(BBVoting);
     }).then(function(rs){
        voting = rs;
        return deployer.deploy(BBVotingHelper);
     }).then(function(rs){
        votingHelper = rs;
        return ProxyFactory.at(proxyFactAddress).createProxy('0xf76fca3604e2005fe59bd59bdf97075f631fd2bc', params.address, {gas: 6800000})
     }).then(function(l){
        paramsProxy = l.logs.find(l => l.event === 'ProxyCreated').args.proxy
        console.log('paramsProxy', paramsProxy);
        return ProxyFactory.at(proxyFactAddress).createProxy('0xf76fca3604e2005fe59bd59bdf97075f631fd2bc', dispute.address, {gas: 6800000});
     }).then(function(l){
        disputeProxy = l.logs.find(l => l.event === 'ProxyCreated').args.proxy
        console.log('disputeProxy', disputeProxy)
        return ProxyFactory.at(proxyFactAddress).createProxy('0xf76fca3604e2005fe59bd59bdf97075f631fd2bc', voting.address, {gas: 6800000});
     }).then(function(l){
        votingProxy = l.logs.find(l => l.event === 'ProxyCreated').args.proxy
        console.log('votingProxy', votingProxy)
        return ProxyFactory.at(proxyFactAddress).createProxy('0xf76fca3604e2005fe59bd59bdf97075f631fd2bc', votingHelper.address, {gas: 6800000});
     }).then(function(l){
        votingHelperProxy = l.logs.find(l => l.event === 'ProxyCreated').args.proxy
        console.log('votingHelperProxy', votingHelperProxy)
        return BBStorage.at(storageAddress).addAdmin(paramsProxy, true, {gas: 6800000});
     }).then(function(){
        return BBStorage.at(storageAddress).addAdmin(disputeProxy, true, {gas: 6800000});
     }).then(function(){
        return BBStorage.at(storageAddress).addAdmin(votingProxy, true, {gas: 6800000});
     }).then(function(){
        return BBParams.at(paramsProxy).transferOwnership('0xb10ca39dfa4903ae057e8c26e39377cfb4989551', {gas: 6800000});
     }).then(function(){
        return BBParams.at(paramsProxy).setStorage(storageAddress, {gas: 6800000});
     }).then(function(){
        return BBVotingHelper.at(votingHelperProxy).transferOwnership('0xb10ca39dfa4903ae057e8c26e39377cfb4989551', {gas: 6800000});
     }).then(function(){
        return BBVotingHelper.at(votingHelperProxy).setStorage(storageAddress, {gas: 6800000});
     }).then(function(){
        return BBVotingHelper.at(votingHelperProxy).setBBO('0x1d893910d30edc1281d97aecfe10aefeabe0c41b', {gas: 6800000});
     }).then(function(){
        return BBVoting.at(votingProxy).transferOwnership('0xb10ca39dfa4903ae057e8c26e39377cfb4989551', {gas: 6800000});
     }).then(function(){
        return BBVoting.at(votingProxy).setStorage(storageAddress, {gas: 6800000});
     }).then(function(){
        return BBVoting.at(votingProxy).setBBO('0x1d893910d30edc1281d97aecfe10aefeabe0c41b', {gas: 6800000});
     }).then(function(){
        return BBVoting.at(votingProxy).setHelper(votingHelperProxy, {gas: 6800000});
     }).then(function(){
        return BBDispute.at(disputeProxy).transferOwnership('0xb10ca39dfa4903ae057e8c26e39377cfb4989551', {gas: 6800000});
     }).then(function(){
        return BBDispute.at(disputeProxy).setStorage(storageAddress, {gas: 6800000});
     }).then(function(){
        return BBDispute.at(disputeProxy).setBBO('0x1d893910d30edc1281d97aecfe10aefeabe0c41b', {gas: 6800000});
     }).then(function(){
        return BBDispute.at(disputeProxy).setPayment(proxyAddressPayment, {gas: 6800000});
     }).then(function(){
        return BBDispute.at(disputeProxy).setVoting(votingProxy, {gas: 6800000});
     }).then(function(){
        return BBDispute.at(disputeProxy).setVotingHelper(votingHelperProxy, {gas: 6800000});
     }).then(function(){
        console.log('done')
     })
    
   }  
};
