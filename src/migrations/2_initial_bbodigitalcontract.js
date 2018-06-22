var BigbomDigitalContract = artifacts.require("./BigbomDigitalContract.sol");

module.exports = function(deployer) {
   deployer.deploy(BigbomDigitalContract);
};
