import forge from 'node-forge';

export function testMe() {


    // Create a new key pair for the CA
    const caKeys = forge.pki.rsa.generateKeyPair(2048);
    const caCert = forge.pki.createCertificate();

    // Set the CA certificate properties
    caCert.publicKey = caKeys.publicKey;
    caCert.serialNumber = '01';
    caCert.validity.notBefore = new Date();
    caCert.validity.notAfter = new Date();
    caCert.validity.notAfter.setFullYear(caCert.validity.notBefore.getFullYear() + 10);

    const caAttrs = [
        { name: 'commonName', value: 'My Root CA' },
        { name: 'countryName', value: 'US' },
        { shortName: 'ST', value: 'California' },
        { name: 'localityName', value: 'San Francisco' },
        { name: 'organizationName', value: 'My Company' },
        { shortName: 'OU', value: 'CA Division' }
    ];

    caCert.setSubject(caAttrs);
    caCert.setIssuer(caAttrs);
    caCert.setExtensions([
        { name: 'basicConstraints', cA: true },
        { name: 'keyUsage', keyCertSign: true, cRLSign: true },
        { name: 'subjectKeyIdentifier' }
    ]);

    // Self-sign the CA certificate
    caCert.sign(caKeys.privateKey, forge.md.sha256.create());

    console.log('CA Certificate created');


    // Create a new key pair for the intermediate certificate
    const intermediateKeys = forge.pki.rsa.generateKeyPair(2048);
    const intermediateCert = forge.pki.createCertificate();

    // Set the intermediate certificate properties
    intermediateCert.publicKey = intermediateKeys.publicKey;
    intermediateCert.serialNumber = '02';
    intermediateCert.validity.notBefore = new Date();
    intermediateCert.validity.notAfter = new Date();
    intermediateCert.validity.notAfter.setFullYear(intermediateCert.validity.notBefore.getFullYear() + 5);

    const intermediateAttrs = [
        { name: 'commonName', value: 'My Intermediate CA' },
        { name: 'countryName', value: 'US' },
        { shortName: 'ST', value: 'California' },
        { name: 'localityName', value: 'San Francisco' },
        { name: 'organizationName', value: 'My Company' },
        { shortName: 'OU', value: 'Intermediate CA Division' }
    ];

    intermediateCert.setSubject(intermediateAttrs);
    intermediateCert.setIssuer(caCert.subject.attributes);
    intermediateCert.setExtensions([
        { name: 'basicConstraints', cA: true, pathLenConstraint: 0 },
        { name: 'keyUsage', keyCertSign: true, cRLSign: true },
        { name: 'subjectKeyIdentifier' },
        { name: 'authorityKeyIdentifier', keyIdentifier: forge.pki.getPublicKeyFingerprint(caCert.publicKey) }
    ]);

    // Sign the intermediate certificate with the CA private key
    intermediateCert.sign(caKeys.privateKey, forge.md.sha256.create());

    console.log('Intermediate Certificate created');


    // Create a new key pair for the end-user certificate
    const userKeys = forge.pki.rsa.generateKeyPair(2048);
    const userCert = forge.pki.createCertificate();

    // Set the end-user certificate properties
    userCert.publicKey = userKeys.publicKey;
    userCert.serialNumber = '03';
    userCert.validity.notBefore = new Date();
    userCert.validity.notAfter = new Date();
    userCert.validity.notAfter.setFullYear(userCert.validity.notBefore.getFullYear() + 1);

    const userAttrs = [
        { name: 'commonName', value: 'John Doe' },
        { name: 'countryName', value: 'US' },
        { shortName: 'ST', value: 'California' },
        { name: 'localityName', value: 'San Francisco' },
        { name: 'organizationName', value: 'My Company' },
        { shortName: 'OU', value: 'User Division' }
    ];

    userCert.setSubject(userAttrs);
    userCert.setIssuer(intermediateCert.subject.attributes);
    userCert.setExtensions([
        { name: 'basicConstraints', cA: false },
        { name: 'keyUsage', digitalSignature: true, keyEncipherment: true },
        { name: 'subjectKeyIdentifier' },
        { name: 'authorityKeyIdentifier', keyIdentifier: forge.pki.getPublicKeyFingerprint(intermediateCert.publicKey) }
    ]);

    // Sign the end-user certificate with the intermediate private key
    userCert.sign(intermediateKeys.privateKey, forge.md.sha256.create());

    console.log('End-User Certificate created');




    // Convert to PEM format
    const caCertPem = forge.pki.certificateToPem(caCert);
    const intermediateCertPem = forge.pki.certificateToPem(intermediateCert);
    const userCertPem = forge.pki.certificateToPem(userCert);
    const caKeyPem = forge.pki.privateKeyToPem(caKeys.privateKey);
    const intermediateKeyPem = forge.pki.privateKeyToPem(intermediateKeys.privateKey);
    const userKeyPem = forge.pki.privateKeyToPem(userKeys.privateKey);

    console.log('CA Cert PEM:\n', caCertPem);
    console.log('Intermediate Cert PEM:\n', intermediateCertPem);
    console.log('User Cert PEM:\n', userCertPem);
    console.log('CA Key PEM:\n', caKeyPem);
    console.log('Intermediate Key PEM:\n', intermediateKeyPem);
    console.log('User Key PEM:\n', userKeyPem);

}

// URIError: URI malformed
testMe();