const DigitalContract =  artifacts.require("BigbomDigitalContract");
const BBStorage =  artifacts.require("BBStorage");


module.exports = function(deployer) {
   var storageaddress;
   return BBStorage.new().then(function(storage){
   	 storageaddress = storage.address;
   	 return DigitalContract.new();
   }).then(function(instance){
   	console.log('address', storageaddress)
   	 return instance.setStorage(storageaddress);
   }).then(function(rs){
   	 console.log(rs);
   	 process.exit(1);
   });
};
