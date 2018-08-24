const BBStorage =  artifacts.require("BBStorage");
contract('BBStorage Test', async (accounts) => {
  var storageAddress;
  it("init", async() => {
   let storage = await BBStorage.new({from: accounts[0]});
   storageAddress = storage.address;
   await storage.addAdmin(accounts[1], {from: accounts[0]} );
  });
  it("get/set value", async() => {
   let storage = await BBStorage.at(storageAddress);
   let key = web3.sha3('test');

   await storage.setAddress(key,accounts[1], {from: accounts[1]} );
   let addressVal = await storage.getAddress(key);
   assert.equal(accounts[1], addressVal);

   await storage.setUint(key,Math.pow(2,255), {from: accounts[1]} );
   let uintVal = await storage.getUint(key);
   assert.equal(Math.pow(2,255), uintVal);

   await storage.setString(key,'test', {from: accounts[1]} );
   let stringVal = await storage.getString(key);
   assert.equal('test', stringVal);

   await storage.setBytes(key,'testbytes', {from: accounts[1]} );
   let bytesVal = await storage.getBytes(key);
   assert.equal('testbytes',web3.toAscii(bytesVal));

   await storage.setBool(key,true, {from: accounts[1]} );
   let boolVal = await storage.getBool(key);
   assert.equal(true, boolVal);

   await storage.setInt(key,2, {from: accounts[1]} );
   let intVal = await storage.getInt(key);
   assert.equal(2, intVal);

  });
  it("get/delete value", async() => {
   let storage = await BBStorage.at(storageAddress);
   let key = web3.sha3('test');

   await storage.deleteAddress(key, {from: accounts[1]} );
   let addressVal = await storage.getAddress(key);
   assert.equal(0x0, addressVal);

   await storage.deleteUint(key, {from: accounts[1]} );
   let uintVal = await storage.getUint(key);
   assert.equal(0x0, uintVal);

   await storage.deleteString(key, {from: accounts[1]} );
   let stringVal = await storage.getString(key);
   assert.equal('', stringVal);

   await storage.deleteBytes(key,{from: accounts[1]} );
   let bytesVal = await storage.getBytes(key);
   assert.equal('',web3.toAscii(bytesVal));

   await storage.deleteBool(key, {from: accounts[1]} );
   let boolVal = await storage.getBool(key);
   assert.equal(false, boolVal);

   await storage.deleteInt(key, {from: accounts[1]} );
   let intVal = await storage.getInt(key);
   assert.equal(0x0, intVal);

  });
  it("add/remove admin", async() => {
   let storage = await BBStorage.at(storageAddress);
   await storage.addAdmin(accounts[2]);
   await storage.removeAdmin(accounts[2]);
  });



   it("remove self", async() => {
    let storage = await BBStorage.at(storageAddress);
    try {
      await storage.removeAdmin(accounts[0]);  
      //console.log('Can remove self');
    return false;
  } catch (e) {
    //console.log('Can not remove self');
    return true;
  }
   });

   it("add double admin", async() => {
    try {
    let storage = await BBStorage.at(storageAddress);
    await storage.addAdmin(accounts[2]);
    await storage.addAdmin(accounts[2]);
    return false;
 
  } catch (e) {

    return true;
  }});

  it("remove double admin", async() => {
    try {
    let storage = await BBStorage.at(storageAddress);
    await storage.addAdmin(accounts[2]);
    await storage.removeAdmin(accounts[0]);
    await storage.removeAdmin(accounts[2]);
    //console.log('OKKKK');
    return false;
 
  } catch (e) {
    //console.log('FAILSEEEEE');
    return true;
  }});
})