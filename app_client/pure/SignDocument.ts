import * as fs from 'fs';
import * as path from 'path';
import * as forge from 'node-forge';
import { loadKeys } from './GenerateKeys';

// Function to sign a document
export function signDocument(privateKeyPem: string, document: string): { data: string, signature: string } {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

    // Create a SHA256 hash of the document
    const md = forge.md.sha256.create();
    md.update(document, 'utf8');

    // Sign the hash
    const signature = privateKey.sign(md);
    const signatureHex = forge.util.bytesToHex(signature);

    return { data: document, signature: signatureHex };
}

export function signAndSaveDocument(data?: string, dir?: string, name?: string) {
    const { privateKey, publicKey } = loadKeys(dir ?? "")

    const document = data ?? 'Example: The content of the document to be signed';
    const signedDocument = signDocument(privateKey, document);

    fs.writeFileSync(path.join(__dirname, dir ?? "", name ?? 'signedDocument.json'), JSON.stringify(signedDocument, null, 2));

    console.log('Document signed and saved successfully.');
}
