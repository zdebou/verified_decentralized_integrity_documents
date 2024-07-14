import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs/promises';
import { createReadStream, ReadStream } from "fs";
import * as path from 'path';
import mime from 'mime'
import * as formidable from 'formidable';
import { Authenticator } from './tools/Authenticator';
import { SubscriptionOracle } from './tools/SubscriptionOracle';

const __version__ = "0.1";
// Address of the DTsubscriptions smart contract.
const __subscription__ = "0x7da7F4E0C435226a7470Fb5c12cD035641E48DBb"

class PodService {
    static serverVersion = `SimpleHTTPWithUpload/${__version__}`;
    static authenticator = new Authenticator();

    private subscriptionOracle: SubscriptionOracle;

    constructor(private podPk: string) {
        this.subscriptionOracle = new SubscriptionOracle(__subscription__, this.podPk);
    }

    public async handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
        switch (req.method) {
            case 'GET':
                await this.doGet(req, res);
                break;
            case 'POST':
                await this.doPost(req, res);
                break;
            default:
                res.writeHead(405, { 'Content-Type': 'text/plain' });
                res.end('Method Not Allowed');
        }
    }

    private async doGet(req: http.IncomingMessage, res: http.ServerResponse) {
        const { auth_token: authToken, claim, id_subscription: idSubscription } = url.parse(req.url || '', true).query;

        if (!authToken || !claim || !idSubscription) return this.sendError(res, 400, 'Bad request');
        if (!PodService.authenticator.authenticate(req.url || '', authToken as string, claim as string)) return this.sendError(res, 400, 'Authentication failed, bad request');
        if (!await this.subscriptionOracle.pullSubscriptionVerification(parseInt(idSubscription as string), claim as string)) return this.sendError(res, 400, 'Subscription not verified, bad request');

        const fileStream = await this.sendHead(url.parse(req.url || '').pathname || '', res);
        if (fileStream) fileStream.pipe(res);
    }

    private async doPost(req: http.IncomingMessage, res: http.ServerResponse) {
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields) => {
            if (err) return this.sendError(res, 400, 'Bad Request');
            const { auth_token: authToken, claim, id_subscription: idSubscription } = fields;

            if (authToken && claim && idSubscription) {
                req.url = url.format({ pathname: req.url, query: { auth_token: authToken, claim, id_subscription: idSubscription } });
                await this.doGet(req, res);
            } else {
                this.sendError(res, 400, 'Missing parameters');
            }
        });
    }

    private async sendHead(pathname: string, res: http.ServerResponse): Promise<ReadStream | null> {
        const filePath = this.translatePath(pathname);
        try {
            const stats = await fs.stat(filePath);
            if (stats.isDirectory()) {
                this.sendError(res, 404, 'Pod resource not found');
                return null
            }

            res.writeHead(200, { 'Content-Type': this.guessType(filePath) });
            return createReadStream(filePath);
        } catch {
            this.sendError(res, 404, 'Pod resource not found');
            return null;
        }
    }

    private translatePath(pathname: string): string {
        const parsedPath = path.normalize(decodeURIComponent(pathname));
        return path.join(__dirname, ...parsedPath.split('/').filter(Boolean));
    }

    private guessType(filePath: string): string {
        return mime.getType(filePath) || 'application/octet-stream';
    }

    private sendError(res: http.ServerResponse, code: number, message: string) {
        res.writeHead(code, { 'Content-Type': 'text/plain' });
        res.end(message);
    }
}

export class StoppableHTTPServer {
    private server: http.Server;
    private stopped = false;

    constructor(hostname: string, port: number, basePath: string) {
        this.server = http.createServer(async (req, res) => {
            const podService = new PodService(basePath);
            await podService.handleRequest(req, res);
        }).listen(port, hostname, () => console.log(`Server running at http://${hostname}:${port}/`));

        process.on('SIGINT', () => this.forceStop());
    }

    private forceStop() {
        console.log('Stopping server...');
        this.server.close(() => console.log('Server stopped.'));
    }
}
