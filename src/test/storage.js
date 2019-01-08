const BBStorage =  artifacts.require("BBStorage");
contract('BBStorage Test', async (accounts) => {
  var storageAddress;
  it("init", async() => {
   let storage = await BBStorage.new({from: accounts[0]});
   storageAddress = storage.address;
   await storage.addAdmin(accounts[1], true, {from: accounts[0]} );
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
   await storage.addAdmin(accounts[2], true);
   await storage.addAdmin(accounts[2], false);
  });



   it("remove self", async() => {
    let storage = await BBStorage.at(storageAddress);
    try {

      await storage.addAdmin(accounts[0], false);  

    return false;
  } catch (e) {
    
    return true;
  }
   });

   it("add double admin", async() => {
    try {
    let storage = await BBStorage.at(storageAddress);
    await storage.addAdmin(accounts[2], true);
    await storage.addAdmin(accounts[2], true);
    return false;
 
  } catch (e) {

    return true;
  }});

  it("remove double admin", async() => {
    try {
    let storage = await BBStorage.at(storageAddress);

    await storage.addAdmin(accounts[2], true);
    await storage.addAdmin(accounts[0], false);
    await storage.addAdmin(accounts[2], false);
    return false;
 
  } catch (e) {
    
    return true;
  }});
})