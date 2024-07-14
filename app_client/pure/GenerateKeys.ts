import * as fs from 'fs';
import * as path from 'path';
import * as forge from 'node-forge';

// To digitally sign a document using TypeScript and Node.js
// Function to generate a key pair
export function generateKeyPair(): { privateKey: string, publicKey: string } {
    const keypair = forge.pki.rsa.generateKeyPair(2048);
    const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
    const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
    return { privateKey: privateKeyPem, publicKey: publicKeyPem };
}

export function generateAndSaveKeys(dir: string) {
    const { privateKey, publicKey } = generateKeyPair();
    fs.writeFileSync(path.join(__dirname, dir, 'privateKey.pem'), privateKey);
    fs.writeFileSync(path.join(__dirname, dir, 'publicKey.pem'), publicKey);
}

export function loadKeys(dir: string) {
    const privateKey = fs.readFileSync(path.join(__dirname, dir, 'privateKey.pem', ), 'utf8');
    const publicKey = fs.readFileSync(path.join(__dirname, dir, 'publicKey.pem'), 'utf8');

    return { privateKey, publicKey }
}

