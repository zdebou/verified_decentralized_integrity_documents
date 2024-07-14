import * as forge from 'node-forge';

export function signData(privateKey: string, data: string): string {
    const sign = forge.md.sha256.create();
    sign.update(data, 'utf8');
    const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
    return forge.util.encode64(privateKeyObj.sign(sign));
}