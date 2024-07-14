import * as crypto from 'crypto';

function verifyDigitalSignature(publicKey: string, data: Buffer, signature: Buffer): boolean {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();
    return verify.verify(publicKey, signature);
}

function getPublicKeyFromCertificate(cert: string): string {
    const certLines = cert.split('\n');
    const beginCert = certLines.indexOf('-----BEGIN CERTIFICATE-----');
    const endCert = certLines.indexOf('-----END CERTIFICATE-----');
    if (beginCert === -1 || endCert === -1) {
        throw new Error('Invalid certificate format');
    }
    const certBase64 = certLines.slice(beginCert + 1, endCert).join('');
    const certBuffer = Buffer.from(certBase64, 'base64');

    const certificate = crypto.createPublicKey(certBuffer);
    return certificate.export({ type: 'spki', format: 'pem' }).toString();
}

function verifyRootCA(cert: string, rootCA: string): boolean {
    const publicKey = getPublicKeyFromCertificate(rootCA);

    const certBuffer = Buffer.from(cert.split('\n').slice(1, -1).join(''), 'base64');
    const tbsCertificate = certBuffer.slice(4, certBuffer.length - 256); // Simplified extraction
    const certSignature = certBuffer.slice(certBuffer.length - 256);

    return verifyDigitalSignature(publicKey, tbsCertificate, certSignature);
}


function getExampleData() {
    const signature = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0VwZ5OZC3Ic8ChQ8hbjG
1VQKgpJl/6VR6rP8X5kK4ibih/NcdWsb/h0bQYZZLw5b9X5Vrsj5z6YQW6p84KkD
9BS9mlg4BdfduKkXmkJvZ/NyAqR6EXmI8fzKqkn7j6dUI92rjFdbtUQipErLzjth
uhrjds7pknXrCLpDsKl63H1/kvq2o3+L0A0h8o8O51lvBxJZc+QQ3y6m6k0u+4ow
nKqAKQ9LTC1gLNSkP5rU6e1Ez8fy+yKt9/hRrZjN5xd0sZ6kFLs8TTPdVZjHw3i3
pMQNnZhBg3xEqK5ShfBlKDEZn8/WzQzCE6q60iwO4tXkhGxv5uJfMo8g1P6UKX1A
FQIDAQAB
-----END PUBLIC KEY-----`; // The public key of the signer in PEM format
    const certificate = `-----BEGIN CERTIFICATE-----
MIIC6jCCAdKgAwIBAgIUPSAI3XqB2NNiTxkRlTx3BoQ7wbcwDQYJKoZIhvcNAQEL
BQAwgYkxCzAJBgNVBAYTAklOMQswCQYDVQQIDAJLUjERMA8GA1UEBwwIS2FubmFk
YTAeFw0yMzA2MjYwOTM2MjVaFw0yNDA2MjUwOTM2MjVaMIGJMQswCQYDVQQGEwJJ
TjELMAkGA1UECAwCS1IxETAPBgNVBAcMCEthbm5hZGEwMRAwDgYDVQQKDAdFeGFt
cGxlMRAwDgYDVQQLDAdFeGFtcGxlMRIwEAYDVQQDDAlleGFtcGxlLmNvbTEgMB4G
CSqGSIb3DQEJARYRZXhhbXBsZUBleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcNAQEB
BQADggEPADCCAQoCggEBAOcVb+XK9RG2Nv3zXN4BPOVSPa6UQ12Dt6BwAz/DW8U+
czrr0Dj5lwW0iK9UEKrCzMEvDkg17lbRftmfFbXaqmFH01ryzU8k5Sy2WhHNTzNB
3VjolX+aG6x3MmO9JglMVFz1MeZBZ61gNhYwFZQk9lb4T2kV5WvMtVn9tEHDjAX3
rXLUNzJ5rb8jF8hLb6UslxLgG3gZG7Qn9T9c3Ol8rP64T3uJ6XhR5WhHqLBfZ5s7
m0DQ1odNW9bXTXIRiQTXVGcAAcsmTwhO+g7MBeF9CkNiBtLptUoc1NO8j7YzFR5N
HqGatOF/fXWCOjK/iByz6gQF55FZed37iQ1Fb9yXKjcCAwEAAaNTMFEwHQYDVR0O
BBYEFNC56HEygsNkFSBHHypA2nDwj2LpMB8GA1UdIwQYMBaAFNC56HEygsNkFSBH
HypA2nDwj2LpMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAH5p
8lP8v9eEdxrBOphwfw+LUZLJ+2Khj1LVpMZsbnZkhcH2RjK7SmlmjxxiE8kS03Mj
Qw74xBJbU/A5CqCkwV0u7O2Y7hlfHg6W/kX9P+AS6pX/5qqV+fjAzIMAF5xXMhgt
UvDfEhec8pQ/2eGx1puNocC9B3i9p4VQ18izk6R6QihUyJja5sMz+3c1ZhS5L9Gh
lG9X5nynLDHir7qLoCJm1O+mH5FJS9M95BjPi0i5Bo+fdUMKrmYX4/Py51upZlEr
E9i3xWcAlVtgsJAKVu8PaaClAPjoY6KPC/ABawHb7T3u6T+pFTIvsxqU5oaN6TAw
kpV1svjtVG6VcnS7fXA=
-----END CERTIFICATE-----`; // The certificate in PEM format

    const rootCA = `-----BEGIN CERTIFICATE-----
MIIC6jCCAdKgAwIBAgIUPSAI3XqB2NNiTxkRlTx3BoQ7wbcwDQYJKoZIhvcNAQEL
BQAwgYkxCzAJBgNVBAYTAklOMQswCQYDVQQIDAJLUjERMA8GA1UEBwwIS2FubmFk
YTAeFw0yMzA2MjYwOTM2MjVaFw0yNDA2MjUwOTM2MjVaMIGJMQswCQYDVQQGEwJJ
TjELMAkGA1UECAwCS1IxETAPBgNVBAcMCEthbm5hZGEwMRAwDgYDVQQKDAdFeGFt
cGxlMRAwDgYDVQQLDAdFeGFtcGxlMRIwEAYDVQQDDAlleGFtcGxlLmNvbTEgMB4G
CSqGSIb3DQEJARYRZXhhbXBsZUBleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcNAQEB
BQADggEPADCCAQoCggEBAOcVb+XK9RG2Nv3zXN4BPOVSPa6UQ12Dt6BwAz/DW8U+
czrr0Dj5lwW0iK9UEKrCzMEvDkg17lbRftmfFbXaqmFH01ryzU8k5Sy2WhHNTzNB
3VjolX+aG6x3MmO9JglMVFz1MeZBZ61gNhYwFZQk9lb4T2kV5WvMtVn9tEHDjAX3
rXLUNzJ5rb8jF8hLb6UslxLgG3gZG7Qn9T9c3Ol8rP64T3uJ6XhR5WhHqLBfZ5s7
m0DQ1odNW9bXTXIRiQTXVGcAAcsmTwhO+g7MBeF9CkNiBtLptUoc1NO8j7YzFR5N
HqGatOF/fXWCOjK/iByz6gQF55FZed37iQ1Fb9yXKjcCAwEAAaNTMFEwHQYDVR0O
BBYEFNC56HEygsNkFSBHHypA2nDwj2LpMB8GA1UdIwQYMBaAFNC56HEygsNkFSBH
HypA2nDwj2LpMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAH5p
8lP8v9eEdxrBOphwfw+LUZLJ+2Khj1LVpMZsbnZkhcH2RjK7SmlmjxxiE8kS03Mj
Qw74xBJbU/A5CqCkwV0u7O2Y7hlfHg6W/kX9P+AS6pX/5qqV+fjAzIMAF5xXMhgt
UvDfEhec8pQ/2eGx1puNocC9B3i9p4VQ18izk6R6QihUyJja5sMz+3c1ZhS5L9Gh
lG9X5nynLDHir7qLoCJm1O+mH5FJS9M95BjPi0i5Bo+fdUMKrmYX4/Py51upZlEr
E9i3xWcAlVtgsJAKVu8PaaClAPjoY6KPC/ABawHb7T3u6T+pFTIvsxqU5oaN6TAw
kpV1svjtVG6VcnS7fXA=
-----END CERTIFICATE-----`; // The root CA certificate in PEM format

    return { signature, certificate, rootCA }
}