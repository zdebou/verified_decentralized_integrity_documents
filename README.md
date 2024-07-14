# Blockchain based verification of signature
Original github repo: https://github.com/zdebou/verified_decentralized_integrity_documents


## Install & tests

To install and start tests for a project using npm and TypeScript, you can follow these steps:

1. Make sure you have Node.js (tested on v20.14.0) and npm (tested on v10.8.1) installed on your machine. You can download them from the official Node.js website: https://nodejs.org. Linux machine is expected (tested on WSL2/Ubuntu-22.04)

2. Open a terminal or command prompt and navigate to the root directory of the project.

3. Run the following command to install the project dependencies specified in the [`package.json`]
   ```
   npm install
   ```

4. Once the dependencies are installed, you can run the tests. The command is defined in the `scripts` section of the `package.json` file.

   Look for a script named `"tests-network"`:
   ```json
   "scripts": {
     "tests-network": "....."
   }
   ```

   Run the test command by executing the following command in the terminal:
   ```
   npm run tests-network
   ```

   This will execute the tests as well as blockhain node and display the results in the terminal.
   If it does not work run separetly `npm run start-node` and when initialized run `npm run start-node-tests`;

That's it! You should now be able to install the project dependencies and run the tests for the project.

## DEV:
- use TDD
- to limit scope of tests (example): `npx hardhat test --grep Crypto`
- suggested to use VSCode, in case of type errors by IDE -> restart the IDE /or at least tsc service)
- hardhat allows to run local blockchain without need fot local network
- Solid Server: https://communitysolidserver.github.io/CommunitySolidServer/5.x/docs/
- repo structure:
    - app_shared - common typescript utils (x509 manipulation, blockchain event accesors)
    - contracts -  definition of smart contracts
    - test - TDD tests
    - ignition - deployment scripts
    - app_client - scaffolding of client web app
    - app_services - ports of python from https://github.com/dave0909/DecentralTrading

## FAQ:
-  Why emit event in case of return value?
    > Return value is only available on-chain, off-chain (such as tests) does not have access

- Why events?
    > Only on-chain operationa can access return values, otherwise event emit is required. This implies that also a client app needs to be event-based (=> listen to blochchain changes)

- Why type-safety
    > Generated types for smart contracts helps in longerm stability of project development and 

