// Copyright (C) 2020  Christian Felde

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const convertUtils = artifacts.require("ConvertUtils");
const akap = artifacts.require("IAKAP");
const domainManager = artifacts.require("DomainManager");
const exampleOne = artifacts.require("ExampleOne");

async function getAkapNodeValue(akapInstance, node) {
    return await akapInstance.nodeBody(node);
}

async function setAkapChildValue(dmInstance, akapInstance, node, key, value) {
    await dmInstance.claim(node, key);
    let valueNode = await akapInstance.hashOf(node, key);
    await akapInstance.setNodeBody(valueNode, value);
}

async function getAkapChildValue(akapInstance, node, key) {
    let valueNode = await akapInstance.hashOf(node, key);
    return await akapInstance.nodeBody(valueNode);
}

contract("When executing our contract, it:", async accounts => {
    it("should be possible to write what the contract reads using AKAP", async () => {
        let cu = await convertUtils.deployed();
        let dmInstance = await domainManager.deployed();
        let akapInstance = await akap.at(await dmInstance.akap());
        let rootPtr = await dmInstance.domain();

        let exampleInstance = await exampleOne.deployed();

        // First we're going to populate node 1 and 2 under
        // the node created by our UsingAKAP contract.
        let key1 = await cu.uint256ToBytes(1); // 0x0000000000000000000000000000000000000000000000000000000000000001
        let key2 = await cu.uint256ToBytes(2); // 0x0000000000000000000000000000000000000000000000000000000000000002

        let value1A = "Value 1 is a string";
        let value2A = 1234;

        await setAkapChildValue(dmInstance, akapInstance, rootPtr, key1, web3.utils.toHex(value1A));
        await setAkapChildValue(dmInstance, akapInstance, rootPtr, key2, await cu.uint256ToBytes(value2A));

        // Make sure AKAP values are set correctly..
        assert.equal(value1A, web3.utils.hexToUtf8(await getAkapChildValue(akapInstance, rootPtr, key1)));
        assert.equal(value2A, await cu.bToUint256(await getAkapChildValue(akapInstance, rootPtr, key2)));

        // Next we're going to read these back from our contract..
        // The contract in turn reads them from AKAP
        //let value1B = web3.utils.hexToUtf8(await exampleInstance.getValue1());
        //let value2B = web3.utils.toBN(await exampleInstance.getValue2()).toNumber();
        let value1B = await exampleInstance.getValue1();
        let value2B = await exampleInstance.getValue2();

        assert.equal(value1A, value1B);
        assert.equal(value2A, value2B);
    });

    it("should be possible to read what the contract writes using AKAP", async () => {
        let dmInstance = await domainManager.deployed();
        let akapInstance = await akap.at(await dmInstance.akap());
        let rootPtr = await dmInstance.domain();

        let exampleInstance = await exampleOne.deployed();

        // First call, will set node body to 1
        await exampleInstance.increaseCounter();

        let counter1 = await getAkapNodeValue(akapInstance, rootPtr);
        assert.equal(1, counter1);

        // Second call, will increase node body to 2
        await exampleInstance.increaseCounter();

        let counter2 = await getAkapNodeValue(akapInstance, rootPtr);
        assert.equal(2, counter2);
    });

    it("should be easy to reclaim our contract node", async () => {
        // Instead of having a reclaim function on the contract,
        // we can now use the domain manager reclaim function instead
        let dmInstance = await domainManager.deployed();
        let akapInstance = await akap.at(await dmInstance.akap());
        let rootPtr = await dmInstance.domain();

        let existingExpiry = await akapInstance.expiryOf(rootPtr);

        await dmInstance.reclaim();

        // After calling reclaim the expiry of node should be
        // further into the future than it was previously.
        assert.isTrue(await akapInstance.expiryOf(rootPtr) > existingExpiry);
    })
});