import { expect } from "chai";
import { ethers } from "hardhat";
import { anyUint } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { OwnedDocumentStorage } from "../../typechain-types/contracts/Signed/OwnedSignature.sol/OwnedDocumentStorage";

describe("OwnedDocumentStorage", function () {
  let documentStorage: OwnedDocumentStorage;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    const DocumentStorageFactory: any = await ethers.getContractFactory("OwnedDocumentStorage");
    [owner, addr1] = await ethers.getSigners();
    documentStorage = await DocumentStorageFactory.deploy();
    await documentStorage.waitForDeployment();
  });

  describe("uploadDocument", function () {
    it("Should upload a document and emit an event", async function () {
      const fingerprint = ethers.encodeBytes32String("document1");
      const signature = "signature1";

      await expect(documentStorage.uploadDocument(fingerprint, signature, ""))
        .to.emit(documentStorage, "DocumentUploaded")
        .withArgs(owner.address, fingerprint, signature, anyUint);

      const documents = await documentStorage.getDocuments(owner.address);
      expect(documents.length).to.equal(1);
      expect(documents[0].fingerprint).to.equal(fingerprint);
      expect(documents[0].signature).to.equal(signature);
    });


    it("should return the correct number of documents for a user", async function () {
      const fingerprint1 = ethers.encodeBytes32String("document1");
      const signature1 = "signature1";

      await documentStorage.uploadDocument(fingerprint1, signature1, "");

      const fingerprint2 = ethers.encodeBytes32String("document2");
      const signature2 = "signature2";

      await documentStorage.uploadDocument(fingerprint2, signature2, "");

      const documents = await documentStorage.getDocuments(owner.address);
      expect(documents.length).to.equal(2);
    });


    it("owner should not be able to upload the same document twice", async function () {
      const fingerprint = ethers.encodeBytes32String("document1");
      const signature = "signature1";

      await documentStorage.uploadDocument(fingerprint, signature, "");

      await expect(documentStorage.uploadDocument(fingerprint, signature, "")).to.be.revertedWith("Document already exists");
    });


    it("should not allow upload with empty signature", async function () {
      const fingerprint = ethers.encodeBytes32String("document1");
      const signature = "";

      await expect(documentStorage.uploadDocument(fingerprint, signature, "")).to.be.revertedWith("Signature cannot be empty");
    });

    it("should allow transfer of ownership", async function () {
      const fingerprint = ethers.encodeBytes32String("document1");
      const signature = "signature1";

      await documentStorage.uploadDocument(fingerprint, signature, "");

      await documentStorage.transferOwnership(addr1.address);

      const documents = await documentStorage.getDocuments(addr1.address);
      expect(documentStorage.target).to.not.equal(owner);
    });
  });
});