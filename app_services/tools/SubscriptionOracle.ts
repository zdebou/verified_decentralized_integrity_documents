import { ethers, JsonRpcProvider, getAddress } from 'ethers';
import { Subscription, Subscription__factory } from "../../typechain-types"

export class SubscriptionOracle {
  private subscriptionAddress: string;
  private provider: ethers.JsonRpcProvider;
  private contractInstance: Subscription;

  constructor(subscriptionAddress: string, privateKey: string, rpcUrl: string = 'http://127.0.0.1:8545') {
    this.subscriptionAddress = subscriptionAddress;

    this.provider = new JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, this.provider);
    this.contractInstance = Subscription__factory.connect(this.subscriptionAddress, signer);
  }

  /**
   * Verifies that the subscription id is valid and is related to the claimed identity.
   * @param idSubscription - The subscription ID.
   * @param claim - The claimed identity address.
   * @returns True if the subscription is verified, otherwise false.
   */
  public async pullSubscriptionVerification(idSubscription: number, claim: string): Promise<boolean> {
    // Use ethers utilities to convert address to checksum
    const checksumAddress = ethers.getAddress(claim);
    const result = await this.contractInstance.verifySubscription(idSubscription, checksumAddress);
    console.log('is subscription verified: ', result);
    return result;
  }
}