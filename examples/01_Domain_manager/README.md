# Example one: Domain manager

This is the second example of using the [AKA protocol](https://akap.me),
used to showcase the domain manager. This is referenced by the [AKA docs](https://akap.me/docs)
under [AKA patterns -> Domain manager](https://akap.me/docs/patterns#domain-manager).

Step 1:

You will want to install the AKAP utils and its dependencies.

`npm install akap-utils`

This will also give you `akap` and `@openzeppelin/contracts`.

Step 2:

Follow the example contract `ExampleOne.sol` which is making use of the domain manager.
Also pay attention to the deployment script called `2_deploy_contracts.js` within `migrations`.
Most of the setup is done in the script, which is different to the previous example.

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
