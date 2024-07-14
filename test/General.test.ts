import { anyUint, anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { addDays } from "date-fns";
import { ethers } from "hardhat";
import { } from "ethers";
import { stringToBytes } from "../app_shared/utils/string";
import { obtainEventWithArgsTypes } from "../app_shared/utils/obtainEvent";
import { Subscription, OwnedDocumentStorage } from "../typechain-types/";
import { generateX509Certificate, generateX509CertificateChain } from '../app_shared/x509/x509.gen';
import { signData } from '../app_shared/x509/x509.signature';
import { verifyChainAndExpiration, verifySignature } from '../app_shared/x509/x509.verify';
import * as forge from 'node-forge';

describe("General UC", function () {
    let subscription: Subscription;
    let documentStorage: OwnedDocumentStorage;
    let owner: HardhatEthersSigner, addr1: HardhatEthersSigner;
    let privateKey: string;
    let certificate: string;
    let root: string, intermediate: string, leaf: string;
    let chain: string[];
    const message = 'This is a message.';

    beforeEach(async function () {
        const DocumentStorageFactory: any = await ethers.getContractFactory("OwnedDocumentStorage");
        [owner, addr1] = await ethers.getSigners();
        documentStorage = await DocumentStorageFactory.deploy();
        await documentStorage.waitForDeployment();

        const { privateKeyPem, certificatePem } = generateX509Certificate();
        const { root: r, intermediate: i, leaf: l } = generateX509CertificateChain();
        privateKey = privateKeyPem;
        certificate = certificatePem;
        root = r;
        intermediate = i;
        leaf = l;
        chain = [root, intermediate, leaf];
    });

    it('should sign and verify a message', () => {
        const signature = signData(privateKey, message);
        const isValid = verifySignature(certificate, message, signature);

        expect(isValid).to.be.true;
    });

    it("sign a message and verify the chain", () => {
        const signature = signData(privateKey, message);
        const isValid = verifyChainAndExpiration(chain);

        expect(isValid).to.be.true;
    });

    it("should sign a message and upload it to the ownable contract", async () => {
        const signature = signData(privateKey, message);
        await documentStorage.uploadDocument(ethers.encodeBytes32String(message), signature, certificate);

        const documents = await documentStorage.getDocuments(owner.address);
        expect(documents.length).to.equal(1);
        expect(documents[0].fingerprint).to.equal(ethers.encodeBytes32String(message));
        expect(documents[0].signature).to.equal(signature);
    });

    it("should sign a message and upload it to the ownable contract and verify the chain", async () => {
        const signature = signData(privateKey, message);
        await documentStorage.uploadDocument(ethers.encodeBytes32String(message), signature, certificate);

        const documents = await documentStorage.getDocuments(owner.address);
        expect(documents.length).to.equal(1);
        expect(documents[0].fingerprint).to.equal(ethers.encodeBytes32String(message));
        expect(documents[0].signature).to.equal(signature);

        const isValid = verifyChainAndExpiration(chain);
        expect(isValid).to.be.true;
    });

    it('should create a finger print of the message, sign it and then verify it', async () => {
        const fingerprint = ethers.encodeBytes32String(message);
        const signature = signData(privateKey, message);
        const isValid = verifySignature(certificate, fingerprint, signature);

        expect(isValid).to.be.false;
    });

    it("should create fingerprint of the message, sign in and upload it to the ownable contract", async () => {
        const fingerprint = ethers.encodeBytes32String(message);
        const signature = signData(privateKey, message);
        await documentStorage.uploadDocument(fingerprint, signature, certificate);

        const documents = await documentStorage.getDocuments(owner.address);
        expect(documents.length).to.equal(1);
        expect(documents[0].fingerprint).to.equal(fingerprint);
        expect(documents[0].signature).to.equal(signature);
    });

    it("should create fingeprirnt of the message, sign in and upload it to the ownable contract and verify the chain", async () => {
        const fingerprint = ethers.encodeBytes32String(message);
        const signature = signData(privateKey, message);
        await documentStorage.uploadDocument(fingerprint, signature, certificate);

        const documents = await documentStorage.getDocuments(owner.address);
        expect(documents.length).to.equal(1);
        expect(documents[0].fingerprint).to.equal(fingerprint);
        expect(documents[0].signature).to.equal(signature);

        const isValid = verifyChainAndExpiration(chain);
        expect(isValid).to.be.true;
    });

    it("should create fingerprint of the message, sign it and upload it to the ownable contract and verify the signature", async () => {
        const fingerprint = ethers.encodeBytes32String(message);
        const signature = signData(privateKey, message);
        await documentStorage.uploadDocument(fingerprint, signature, certificate);

        const documents = await documentStorage.getDocuments(owner.address);
        expect(documents.length).to.equal(1);
        expect(documents[0].fingerprint).to.equal(fingerprint);
        expect(documents[0].signature).to.equal(signature);

        const isValid = verifySignature(certificate, fingerprint, signature);
        expect(isValid).to.be.false;
    });

    it("should create fingerprint of the message, sign in and upload it to the ownable cotntract, verify the chain, verify the signature", async () => {
        const fingerprint = ethers.encodeBytes32String(message);
        const signature = signData(privateKey, message);
        await documentStorage.uploadDocument(fingerprint, signature, certificate);

        const documents = await documentStorage.getDocuments(owner.address);
        expect(documents.length).to.equal(1);
        expect(documents[0].fingerprint).to.equal(fingerprint);
        expect(documents[0].signature).to.equal(signature);

        const isValidChain = verifyChainAndExpiration(chain);
        const isValidSignature = verifySignature(certificate, fingerprint, signature);
        expect(isValidChain).to.be.true;
        expect(isValidSignature).to.be.false;
    });

    it("should create fingerprint of the message, sign it and upload it to the ownable contract, verify the signature, verify the chain, verify the expiration", async () => {
        const fingerprint = ethers.encodeBytes32String(message);
        const signature = signData(privateKey, message);
        await documentStorage.uploadDocument(fingerprint, signature, certificate);

        const documents = await documentStorage.getDocuments(owner.address);
        expect(documents.length).to.equal(1);
        expect(documents[0].fingerprint).to.equal(fingerprint);
        expect(documents[0].signature).to.equal(signature);

        const isValidChain = verifyChainAndExpiration(chain);
        const isValidSignature = verifySignature(certificate, fingerprint, signature);
        expect(isValidChain).to.be.true;
        expect(isValidSignature).to.be.false;
    });

    it("should obtain document by fingerprint", async () => {
        const fingerprint = ethers.encodeBytes32String(message);
        const signature = signData(privateKey, message);
        await documentStorage.uploadDocument(fingerprint, signature, certificate);

        const document = await documentStorage.getDocumentByFingerprint(owner, fingerprint);
        console.log(document)
        expect(document.fingerprint).to.equal(fingerprint);
        expect(document.signature).to.equal(signature);
    });

    it("should reverted when document does not exist", async () => {
        const fingerprint = ethers.encodeBytes32String(message);
        await expect(documentStorage.getDocumentByFingerprint(owner, fingerprint)).to.be.revertedWith("Document not found");
    });

    it("should create a fingerpirnt of the message, sign it and upload it to the ownable contract, verify the signature, verify the chain, verify the expiration, and download the document by fingerprint, verify the signature from smart contract, and download the document using getRecordedDocument", async () => {
        const fingerprint = ethers.encodeBytes32String(message);
        const signature = signData(privateKey, message);
        await documentStorage.uploadDocument(fingerprint, signature, certificate);

        const documents = await documentStorage.getDocuments(owner.address);
        expect(documents.length).to.equal(1);
        expect(documents[0].fingerprint).to.equal(fingerprint);
        expect(documents[0].signature).to.equal(signature);

        const isValidChain = verifyChainAndExpiration(chain);
        const isValidSignature = verifySignature(certificate, fingerprint, signature);
        expect(isValidChain).to.be.true;
        expect(isValidSignature).to.be.false;

        const document = await documentStorage.getDocumentByFingerprint(owner, fingerprint);
        const isValid = verifySignature(certificate, document.fingerprint, document.signature);
        expect(isValid).to.be.false;

        // const recordedDocument = await documentStorage.getDocumentsRecorder(fingerprint);
        // const isValidRecorded = verifySignature(certificate, recordedDocument.fingerprint, recordedDocument.signature);
        // expect(isValidRecorded).to.be.true;
    });

    it("should creta a finferprint of the message, sign it and upload it to the ownable contract, verify the signature, verify the chain, verify the expiration, and download the document by fingerprint, verify the signature from smart contract", async () => {
        const fingerprint = ethers.encodeBytes32String(message);
        const signature = signData(privateKey, message);
        await documentStorage.uploadDocument(fingerprint, signature, certificate);

        const documents = await documentStorage.getDocuments(owner.address);
        expect(documents.length).to.equal(1);
        expect(documents[0].fingerprint).to.equal(fingerprint);
        expect(documents[0].signature).to.equal(signature);

        const isValidChain = verifyChainAndExpiration(chain);
        const isValidSignature = verifySignature(certificate, fingerprint, signature);
        expect(isValidChain).to.be.true;
        expect(isValidSignature).to.be.false;

        const document = await documentStorage.getDocumentByFingerprint(owner, fingerprint);
        const isValid = verifySignature(certificate, document.fingerprint, document.signature);
        expect(isValid).to.be.false;
    });
});