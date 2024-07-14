import { createHash } from 'crypto';
import * as moment from 'moment-timezone';
import { ethers } from 'ethers';

export class Authenticator {
    private provider: ethers.JsonRpcProvider;

    constructor() {
        this.provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    }

    /**
     * Rounds the given unix epoch to the last 5 minutes.
     * @param unixTime - Unix timestamp to be rounded.
     * @returns The rounded timestamp.
     */
    private roundedToLast5thMinuteEpoch(unixTime: number): number {
        const dateTime = moment.unix(unixTime);
        const rounded = dateTime.subtract(dateTime.minute() % 5, 'minutes').startOf('minute');
        return rounded.unix();
    }

    /**
     * Gets the current time in Rome timezone.
     * @returns The current time in Rome timezone.
     */
    private getTimeInRome(): moment.Moment {
        return moment.tz('Europe/Rome');
    }

    /**
     * Builds a message composed of the resource path, the :*:*: separator, and the rounded unix time.
     * @param resource - The resource path.
     * @param time - The rounded unix time.
     * @returns The message hash.
     */
    private encodeUnsigned(resource: string, time: string): string {
        const msgToHash = `${resource}:*:*:${time}`;
        return ethers.keccak256(msgToHash) as string;
    }

    /**
     * Verifies if the signature extracted from the HTTP request has been signed by the claimed identity's credentials.
     * @param signature - The signature extracted from the HTTP request.
     * @param msgHash - The unsigned message hash.
     * @param claim - The claimed identity.
     * @returns True if the signature is valid, otherwise false.
     */
    private authenticateSignature(signature: string, msgHash: string, claim: string): boolean {
        const recoveredAddress = ethers.verifyMessage(msgHash, signature);
        return claim === recoveredAddress;
    }

    /**
     * Wrapper function to authenticate the signature extracted from an HTTP request.
     * @param resource - The resource path.
     * @param signature - The signature extracted from the HTTP request.
     * @param claim - The claimed identity.
     * @returns True if the authentication is successful, otherwise false.
     */
    public async authenticate(resource: string, signature: string, claim: string): Promise<boolean> {
        const timeInRome = this.getTimeInRome();
        const rounded = this.roundedToLast5thMinuteEpoch(timeInRome.unix());
        const msgHash = this.encodeUnsigned(resource, rounded.toString());

        const bytesSignature = Buffer.from(signature, 'hex');
        const isAuthenticated = await this.authenticateSignature(bytesSignature.toString('hex'), msgHash, claim);
        console.log(`is authenticated: ${isAuthenticated}`);
        return isAuthenticated;
    }
}
