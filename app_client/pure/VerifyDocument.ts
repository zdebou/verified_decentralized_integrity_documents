import * as fs from 'fs';
import * as forge from 'node-forge';

// Function to verify the signature
function verifySignature(publicKeyPath: string, signedDocumentPath: string): boolean {
  // Load the public key
  const publicKeyPem = fs.readFileSync(publicKeyPath, 'utf8');
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

  // Load the signed document
  const signedDocument = JSON.parse(fs.readFileSync(signedDocumentPath, 'utf8'));
  const { data, signature } = signedDocument;

  // Create a SHA256 hash of the data
  const md = forge.md.sha256.create();
  md.update(data, 'utf8');

  // Verify the signature
  const isValid = publicKey.verify(md.digest().bytes(), forge.util.hexToBytes(signature));
  return isValid;
}

// Example usage
const publicKeyPath = 'path/to/publicKey.pem';
const signedDocumentPath = 'path/to/signedDocument.json';

const isValid = verifySignature(publicKeyPath, signedDocumentPath);
if (isValid) {
  console.log('The document is valid.');
} else {
  console.log('The document is invalid.');
}
