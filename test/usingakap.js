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

const akap = artifacts.require("IAKAP");
const usingAkap = artifacts.require("UsingAKAP");

async function getAkapNodeValue(akapInstance, node) {
    return await akapInstance.nodeBody(node);
}

async function setAkapChildValue(akapInstance, node, key, value) {
    await akapInstance.claim(node, key);
    let valueNode = await akapInstance.hashOf(node, key);
    await akapInstance.setNodeBody(valueNode, value);
}

async function getAkapChildValue(akapInstance, node, key) {
    let valueNode = await akapInstance.hashOf(node, key);
    return await akapInstance.nodeBody(valueNode);
}

contract("When executing our contract, it:", async accounts => {
    it("should be possible to write what the contract reads using AKAP", async () => {
        let usingAkapInstance = await usingAkap.deployed();

        let akapAddress = await usingAkapInstance.akapAddress();
        let node = await usingAkapInstance.node();

        let akapInstance = await akap.at(akapAddress);

        // First we're going to populate node 1 and 2 under
        // the node created by our UsingAKAP contract.
        let value1A = "Value 1 is a string";
        let value2A = 1234;

        await setAkapChildValue(akapInstance, node, [0x1], web3.utils.toHex(value1A));
        await setAkapChildValue(akapInstance, node, [0x2], web3.utils.toHex(value2A));

        // Make sure AKAP values are set correctly..
        assert.equal(value1A, web3.utils.hexToUtf8(await getAkapChildValue(akapInstance, node, [0x1])));
        assert.equal(value2A, web3.utils.toBN(await getAkapChildValue(akapInstance, node, [0x2])).toNumber());

        // Next we're going to read these back from our contract..
        // The contract in turn reads them from AKAP
        let value1B = web3.utils.hexToUtf8(await usingAkapInstance.getValue1());
        let value2B = web3.utils.toBN(await usingAkapInstance.getValue2()).toNumber();

        assert.equal(value1A, value1B);
        assert.equal(value2A, value2B);
    });

    it("should be possible to read what the contract writes using AKAP", async () => {
        let usingAkapInstance = await usingAkap.deployed();

        let akapAddress = await usingAkapInstance.akapAddress();
        let node = await usingAkapInstance.node();

        let akapInstance = await akap.at(akapAddress);

        // First call, will set node body to 1
        await usingAkapInstance.increaseCounter();

        let counter1 = await getAkapNodeValue(akapInstance, node);
        assert.equal(1, counter1);

        // Second call, will increase node body to 2
        await usingAkapInstance.increaseCounter();

        let counter2 = await getAkapNodeValue(akapInstance, node);
        assert.equal(2, counter2);
    });

    it("should be easy to reclaim our contract node", async () => {
        let usingAkapInstance = await usingAkap.deployed();

        let akapAddress = await usingAkapInstance.akapAddress();
        let node = await usingAkapInstance.node();

        let akapInstance = await akap.at(akapAddress);

        let existingExpiry = await akapInstance.expiryOf(node);

        await usingAkapInstance.reclaim();

        // After calling reclaim the expiry of node should be
        // further into the future than it was previously.
        assert.isTrue(await akapInstance.expiryOf(node) > existingExpiry);
    })
});