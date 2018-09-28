const BBParams =  artifacts.require("BBParams");
const BBDispute =  artifacts.require("BBDispute");
const BBVoting =  artifacts.require("BBVoting");
const BBStorage =  artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");

module.exports = async function(deployer) {

   if(deployer.network_id == 3){
     var proxyAddressJob = '0x1900fa17bbe8221873a126bd9e5eb9d0709379ec'
    var proxyAddressBid = '0x39abc4386a817b5d8a4b008e022b446637e2a1eb'
    var proxyAddressPayment = '0x5c6e2663ca0481156a63c7c8ca0372c3efa0471f'
     var storageAddress = '0x03427964b56c3e019d1b1aaf554e1fcd40aac8f9'
     var proxyFactAddress = '0xd4a6CbEF73e5f03093d6f5d59ca27952AC9367B9'

    var paramsProxy = '0x2866cef47dce5db897678695d08f0633102f164a'
    var disputeProxy = '0xdeeaaad9a5f7c63fd2a29db1c9d522b056637b28'
    var votingProxy = '0x347d3adf5081718020d11a2add2a52b39ad9971a'


     let storage = await BBStorage.at(storageAddress);
     let proxyFact = await ProxyFactory.at(proxyFactAddress);
     //  // create bb contract
     // let params = await BBParams.new();
     // let dispute = await BBDispute.new();
     // let voting = await BBVoting.new();

     

     // const l1 = await proxyFact.createProxy('0xf76fca3604e2005fe59bd59bdf97075f631fd2bc', params.address);
     // let paramsProxy = l1.logs.find(l => l.event === 'ProxyCreated').args.proxy
     // console.log('paramsProxy', paramsProxy)
     
     // const l2 = await proxyFact.createProxy('0xf76fca3604e2005fe59bd59bdf97075f631fd2bc', dispute.address);
     // let disputeProxy = l2.logs.find(l => l.event === 'ProxyCreated').args.proxy
     // console.log('disputeProxy', disputeProxy)
     
     // const l3 = await proxyFact.createProxy('0xf76fca3604e2005fe59bd59bdf97075f631fd2bc', voting.address);
     // let votingProxy = l3.logs.find(l => l.event === 'ProxyCreated').args.proxy
     // console.log('votingProxy', votingProxy)

     //   // set admin to storage
     // await storage.addAdmin(paramsProxy, true);
     // await storage.addAdmin(disputeProxy, true);
     // await storage.addAdmin(votingProxy, true);

      let paramsI = await BBParams.at(paramsProxy);
     // console.log('transferOwnership ....')
     // await paramsI.transferOwnership('0xb10ca39dfa4903ae057e8c26e39377cfb4989551');
     // await paramsI.setStorage(storage.address);
     
      let disputeI = await BBDispute.at(disputeProxy);
     // await disputeI.transferOwnership('0xb10ca39dfa4903ae057e8c26e39377cfb4989551');
     // await disputeI.setStorage(storage.address);
     // await disputeI.setBBO('0x1d893910d30edc1281d97aecfe10aefeabe0c41b');
     await disputeI.setPayment(proxyAddressPayment);

     let votingI = await BBVoting.at(votingProxy);
     await votingI.transferOwnership('0xb10ca39dfa4903ae057e8c26e39377cfb4989551');
     await votingI.setStorage(storage.address);
     await votingI.setBBO('0x1d893910d30edc1281d97aecfe10aefeabe0c41b');
     
     console.log('done');
   }  
};
