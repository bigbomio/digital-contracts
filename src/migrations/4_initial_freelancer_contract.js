const BBFreelancerJob =  artifacts.require("BBFreelancerJob");
const BBFreelancerBid =  artifacts.require("BBFreelancerBid");
const BBFreelancerPayment =  artifacts.require("BBFreelancerPayment");
const BBStorage =  artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
const BBOTest = artifacts.require("BBOTest");


module.exports = async function(deployer) {

   if(deployer.network_id != 777){

     let bbo = await BBOTest.at('0x1d893910d30edc1281d97aecfe10aefeabe0c41b');
     console.log('bbo', bbo.address);
     let storage = await BBStorage.new();

      // create bb contract
     let jobInstance = await BBFreelancerJob.new();
     let bidInstance = await BBFreelancerBid.new();
     let paymentInstance = await BBFreelancerPayment.new();

     let proxyFact = await ProxyFactory.new();

     const l1 = await proxyFact.createProxy('0xf76fca3604e2005fe59bd59bdf97075f631fd2bc', jobInstance.address);
     let proxyAddressJob = l1.logs.find(l => l.event === 'ProxyCreated').args.proxy
     console.log('proxyAddressJob', proxyAddressJob)
     
     const l2 = await proxyFact.createProxy('0xf76fca3604e2005fe59bd59bdf97075f631fd2bc', bidInstance.address);
     let proxyAddressBid = l2.logs.find(l => l.event === 'ProxyCreated').args.proxy
     console.log('proxyAddressBid', proxyAddressBid)
     
     const l3 = await proxyFact.createProxy('0xf76fca3604e2005fe59bd59bdf97075f631fd2bc', paymentInstance.address);
     let proxyAddressPayment = l3.logs.find(l => l.event === 'ProxyCreated').args.proxy
     console.log('proxyAddressPayment', proxyAddressPayment)

       // set admin to storage
     await storage.addAdmin(proxyAddressJob, true);
     await storage.addAdmin(proxyAddressBid, true);
     await storage.addAdmin(proxyAddressPayment, true);

     let job = await BBFreelancerJob.at(proxyAddressJob);
     console.log('transferOwnership ....')
     await job.transferOwnership('0xb10ca39dfa4903ae057e8c26e39377cfb4989551');
     await job.setStorage(storage.address);
     console.log('setBBO ....')
     await job.setBBO(bbo.address);

     let bid = await BBFreelancerBid.at(proxyAddressBid);
     await bid.transferOwnership('0xb10ca39dfa4903ae057e8c26e39377cfb4989551');
     await bid.setStorage(storage.address);
     await bid.setBBO(bbo.address);

     let payment = await BBFreelancerPayment.at(proxyAddressPayment);
     await payment.transferOwnership('0xb10ca39dfa4903ae057e8c26e39377cfb4989551');
     await payment.setStorage(storage.address);
     await payment.setBBO(bbo.address);
     console.log('setPaymentContract ....');
     await bid.setPaymentContract(proxyAddressPayment);
     console.log('done');
   }  
};
