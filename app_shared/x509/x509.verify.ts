import * as forge from 'node-forge';

// Verify signature only (no up-chain verification)
export function verifySignature(certificate: string, message: string, signature: string): boolean {
    const cert = forge.pki.certificateFromPem(certificate);

    if (!cert.validity.notBefore || !cert.validity.notAfter) {
        throw new Error('Certificate is not valid.');
    }

    const now = new Date();
    if (now < cert.validity.notBefore || now > cert.validity.notAfter) {
        return false;
    }

    const publicKey = cert.publicKey;
    const md = forge.md.sha256.create();
    md.update(message, 'utf8');



    const signatureBytes = forge.util.decode64(signature);
    return (publicKey as forge.pki.rsa.PublicKey).verify(md.digest().bytes(), signatureBytes);
}

// Last should be leaf = signature public certificate
export function verifyChainAndExpiration(chain: string[]): boolean {
    const certChain = chain.map(certPem => forge.pki.certificateFromPem(certPem));

    const caStore = forge.pki.createCaStore();
    caStore.addCertificate(certChain[0]);
    try {
        // Validate expiration dates
        const now = new Date();
        for (const cert of certChain) {
            if (now < cert.validity.notBefore || now > cert.validity.notAfter) {
                throw new Error(`Certificate ${cert.subject.getField('CN').value} is expired or not yet valid.`);
            }
            if (certChain.indexOf(cert) > 0) {
                // Verify the certificate against the chain
                const issuer = certChain[certChain.indexOf(cert) - 1];
                if (!cert.isIssuer(issuer)) {
                    throw new Error(`Certificate ${cert.subject.getField('CN').value} is not signed by the issuer ${issuer.subject.getField("CN").value}.`);
                }
            }
        }
        return true;
    } catch (e: any) {
        console.error('Verification failed:', e.message);
        return false;
    }
}
