Using AKAP
==========

This repository contains a simple example on how to make use
of the [AKAP](https://akap.me) contract.

The primary purpose is to show you how to get started with your own use
of the AKAP contract.

Step 1:

You will want to install the AKAP contract and its dependencies.

`npm install akap`

Step 2:

Follow the example contract `UsingAKAP.sol` to see how AKAP can be used.
This is not a comprehensive example of everything you can do with AKAP,
but it shows you how to get started.

Step 3:

Use `truffle` to build, deploy and test. When deploying to major test
networks and mainnet, you can use the official AKAP contract address:

`0xaacCAAB0E85b1EfCEcdBA88F4399fa6CAb402349`

However, when deploying to your own local test network, you will first
need to clone and deploy the AKAP contract from https://github.com/cfelde/AKAP.

After you have deployed this locally, take the address of the deployed AKAP
contract on your local test network and put this into the `testNetworkAddress`
variable within `2_deploy_contracts.js`.

You're then good to run the tests..
