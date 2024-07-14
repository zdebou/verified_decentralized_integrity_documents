import { expect } from 'chai';
import { generateX509Certificate, generateX509CertificateChain } from '../../app_shared/x509/x509.gen';
import { signData } from '../../app_shared/x509/x509.signature';
import { verifyChainAndExpiration, verifySignature } from '../../app_shared/x509/x509.verify';
import * as forge from 'node-forge';

describe('Crypto Utils', () => {
    let privateKey: string;
    let certificate: string;
    let root: string, intermediate: string, leaf: string;
    let chain: string[];
    const message = 'This is a message.';

    before(() => {
        const { privateKeyPem, certificatePem } = generateX509Certificate();
        const { root: r, intermediate: i, leaf: l } = generateX509CertificateChain();
        privateKey = privateKeyPem;
        certificate = certificatePem;
        root = r;
        intermediate = i;
        leaf = l;
        chain = [root, intermediate, leaf];
    });

    describe('x509', () => {

        it('should sign and verify a message', () => {
            const signature = signData(privateKey, message);
            const isValid = verifySignature(certificate, message, signature);

            expect(isValid).to.be.true;
        });

        it('should fail verification with an altered message', () => {
            const signature = signData(privateKey, message);
            const alteredMessage = 'This is a different message.';
            const isValid = verifySignature(certificate, alteredMessage, signature);

            expect(isValid).to.be.false;
        });

        it('should fail verification with a different signature', () => {
            const signature = signData(privateKey, message);
            const differentSignature = signData(privateKey, 'Different message');
            const isValid = verifySignature(certificate, message, differentSignature);

            expect(isValid).to.be.false;
        });

        it('should fail verification if the certificate is expired', async () => {
            const { privateKeyPem, certificatePem } = generateX509Certificate(new Date());

            const signature = signData(privateKeyPem, message);
            const isValid = verifySignature(certificatePem, message, signature);

            expect(isValid).to.be.false;
        });

        it('should verify the certificate chain and validate expiration dates', () => {
            const isValid = verifyChainAndExpiration(chain);
            expect(isValid).to.be.true;
        });

        it('should verify a valid certificate chain', () => {
            const isValid = verifyChainAndExpiration(chain);
            expect(isValid).to.be.true;
        });

        it('should fail verification with a broken chain', () => {
            const brokenChain = [leaf, intermediate, root]; // Incorrect order
            const isValid = verifyChainAndExpiration(brokenChain);
            expect(isValid).to.be.false;
        });

        it('should fail verification with an expired certificate', () => {
            const { root, intermediate, leaf } = generateX509CertificateChain(new Date());
            const chain = [root, intermediate, leaf];
            const isValid = verifyChainAndExpiration(chain);
            expect(isValid).to.be.false;
        });

    });
});