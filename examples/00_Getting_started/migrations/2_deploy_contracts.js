const exampleZero = artifacts.require("ExampleZero");

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
        let instance = await deployer.deploy(exampleZero, akapAddress(network));
        let nodeId = await instance.node();

        console.log("Contract created with node id = " + web3.utils.toHex(nodeId));
    });
};