import * as forge from 'node-forge';

interface CreatedX509 {
    cert: forge.pki.Certificate;
    privateKey: forge.pki.PrivateKey;
    publicKey: forge.pki.PublicKey;
}

// Generate an X.509 certificate
export function generateCertificate(commonName: string, issuer?: forge.pki.Certificate, issuerPrivateKey?: forge.pki.PrivateKey, notAfter?: Date): CreatedX509 {
    const keys = forge.pki.rsa.generateKeyPair(2048);
    const cert = forge.pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = commonName + (new Date()).getUTCMilliseconds().toString();
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    if (!!notAfter) {
        cert.validity.notAfter = notAfter;
    }

    const attrs = [{
        name: 'commonName', value: commonName,
    }];

    cert.setSubject(attrs);
    cert.setIssuer(issuer ? issuer.subject.attributes : attrs);
    cert.setExtensions([
        { name: 'basicConstraints', cA: issuer === undefined, pathLenConstraint: 0 },
        { name: 'keyUsage', keyCertSign: true, cRLSign: true, digitalSignature: true, nonRepudiation: true, keyEncipherment: true, dataEncipherment: true },
    ]);

    cert.sign(issuerPrivateKey || keys.privateKey, forge.md.sha256.create());

    return { cert, privateKey: keys.privateKey, publicKey: keys.publicKey };
}

// Generate a simple X.509 digital signature
export function generateX509Certificate(notAfter?: Date) {
    const g = generateCertificate('Simple signature', undefined, undefined, notAfter);

    return {
        privateKeyPem: forge.pki.privateKeyToPem(g.privateKey),
        certificatePem: forge.pki.certificateToPem(g.cert)
    }
}

export function generateX509CertificateChain(notAfter?: Date) {
    const root = generateCertificate('Root CA', undefined, undefined, notAfter);
    const intermediate = generateCertificate('Intermediate CA', root.cert, root.privateKey);
    const leaf = generateCertificate('Leaf Certificate', intermediate.cert, intermediate.privateKey);

    const caStore = forge.pki.createCaStore();

    caStore.addCertificate(root.cert);

    return {
        root: forge.pki.certificateToPem(root.cert),
        intermediate: forge.pki.certificateToPem(intermediate.cert),
        leaf: forge.pki.certificateToPem(leaf.cert),
        leafPrivateKey: forge.pki.privateKeyToPem(leaf.privateKey)
    }
}