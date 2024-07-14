import { anyUint, anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { addDays } from "date-fns";
import { ethers } from "hardhat";
import { obtainEventWithArgsTypes } from "../../app_shared/utils/obtainEvent";
import { Subscription } from "../../typechain-types/";

describe("Subscription Contract", function () {
  let subscription: Subscription;
  let owner: HardhatEthersSigner, addr1: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const SubscriptionFactory = await ethers.getContractFactory("Subscription");
    subscription = await SubscriptionFactory.deploy();
    await subscription.waitForDeployment();

  });

  describe("purchaseSubscription", function () {
    it('The deployer should be the s/c owner', async () => {
      expect(await subscription.owner()).to.equal(owner.address);
    });
    it("Should mint a new subscription NFT", async function () {
      const txResponse = await subscription.purchaseSubscription();
      expect(txResponse).to.emit(subscription, "SubscriptionPurchased").withArgs(owner, anyUint, anyValue);
    });
    it("Should mint a new subscription NFT - sequence", async function () {
      const event = await obtainEventWithArgsTypes(subscription, subscription.purchaseSubscription(), subscription.getEvent("Purchase"));
      expect(event.result.mintedTokens).to.equal(2n);
    });
  });

  describe("isSubscriptionActive", function () {
    it("Should return true for a newly minted subscription", async function () {
      await subscription.purchaseSubscription();
      expect(await subscription.isSubscriptionActive(0n)).to.emit(subscription, "IsActive?").withArgs(owner, anyUint, true);
    });

    it("Should return false for an expired subscription", async function () {
      const event = await obtainEventWithArgsTypes(subscription, subscription.purchaseSubscription(), subscription.getEvent("Purchase"));
      await time.increaseTo(addDays(new Date(), 1000));
      expect(await subscription.isSubscriptionActive(event.result.mintedTokens)).to.be.false;
    });
  });
});