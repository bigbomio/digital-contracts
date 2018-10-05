const BBVoting = artifacts.require("BBVoting");

contract('Voting New Test', async (accounts) => {

  it("initialize contract", async () => {

  	let voting = await BBVoting.new();
  });
})