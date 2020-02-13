const convertUtils = artifacts.require("ConvertUtils");
const akap = artifacts.require("IAKAP");
const domainManager = artifacts.require("DomainManager");
const exampleOne = artifacts.require("ExampleOne");

function akapAddress(network) {
    let officialAddress = "0xaacCAAB0E85b1EfCEcdBA88F4399fa6CAb402349";
    let testNetworkAddress = "REPLACE ME WITH YOUR TESTNET AKAP ADDRESS";

    switch(network) {
        case "goerli": return officialAddress;
        case "rinkeby": return officialAddress;
        case "kovan": return officialAddress;
        case "ropsten": return officialAddress;
        case "mainnet": return officialAddress;
        default: return testNetworkAddress;
    }
}

module.exports = function(deployer, network, accounts) {
    deployer.then(async () => {
        deployer.deploy(convertUtils);

        // Generate a random label for use by our contract
        let randomLabel = new Array(32)
        for (let i = 0; i < randomLabel.length; i++) {
            randomLabel[i] = Math.floor(Math.random() * 256)
        }

        console.log("Using random label = " + randomLabel);

        // Deploy domain manager first, obtain root pointer id
        let dm = await deployer.deploy(domainManager, akapAddress(network), 0x0, randomLabel);
        let akapInstance = await akap.at(akapAddress(network));
        let rootPtr = await akapInstance.hashOf(0x0, randomLabel);

        console.log("Deployed domain manager, with root pointer = 0x" + rootPtr.toString(16));

        // Deploy our example contract, feeding it the domain manager and pointer
        let instance = await deployer.deploy(exampleOne, await dm.address, rootPtr);

        // Give the contract write access for later
        await dm.setApprovalForAll(await instance.address, true);
    });
};
