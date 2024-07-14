# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test --
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/Lock.ts
npx hardhat test --network localhost
```

`npx hardhat node` + `npx hardhat test --network localhost`


Note:
PPK, nor dPPK can be publiclcy shared or stored on blockchain.
dPPK can be shared via pods (and keep authorization for validity) of signee or transfered to document holder, with document (each new signing in the future of this document, would need to validate master key validity)

Difference between:
1) signed then uploaded to bc (unkwnon signee)
    - verify the signature: all root CAs (public keys) needs to be 
2) signed while uploaded to bc (known signer) - we can track the origin & transfer ownership of the document

Versions
a) signed & stored => the CA-public key needs to be stored on blockchain for trust (user can configure different trust providers?) => trust service (.sol)
b) signed & stored & timestamp by TA (CA) - againt trust service (.sol)
c) (not implemented) signed & stored & renewed/timespamped by derivated PPK (single purpose for this, stored on blockchain) => dPPK should be stored on pod (and transfered between signee & document holder, document holder's pod will be accessed by contract for new timestamping), trust service is optional in this case

both)
    - notifications
    - tracking of sharing
    - tracking of new signing
    - autorun - script vs. Chainlink Keepers
    - trust service - provides list of verified public keys, (user specific provider or challange - multliple providers - same opinion)

---
Deriving a private key for a single purpose typically involves generating a subkey or using a hierarchical deterministic (HD) key derivation scheme. One popular standard for this is BIP-32, which is used extensively in the cryptocurrency world. In this context, a master key pair can be used to derive multiple child key pairs.


==================================
DEV: Solid Server: https://communitysolidserver.github.io/CommunitySolidServer/5.x/docs/
