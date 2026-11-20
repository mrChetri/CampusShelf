import { Express } from 'express';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';

export interface TestResponse<T = any> {
  status: number;
  headers: Record<string, any>;
  body: T;
}

export class TestRequest {
  private headers: Record<string, string> = {};
  private payload?: any;

  constructor(
    private app: Express,
    private method: string,
    private path: string
  ) {}

  public set(header: string, value: string): this {
    this.headers[header.toLowerCase()] = value;
    return this;
  }

  public send(body: any): this {
    this.payload = body;
    return this;
  }

  public async then<TResult1 = TestResponse, TResult2 = never>(
    onfulfilled?: ((value: TestResponse) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const promise = new Promise<TestResponse>((resolve, reject) => {
      try {
        const socket = new Socket();
        const req = new IncomingMessage(socket);
        req.method = this.method;
        req.url = this.path;
        req.headers = { ...this.headers };

        const bodyStr = this.payload !== undefined
          ? typeof this.payload === 'string'
            ? this.payload
            : JSON.stringify(this.payload)
          : '';

        if (this.payload !== undefined && !req.headers['content-type']) {
          req.headers['content-type'] = 'application/json';
        }
        if (bodyStr) {
          req.headers['content-length'] = Buffer.byteLength(bodyStr).toString();
        }

        const res = new ServerResponse(req);
        const chunks: Buffer[] = [];

        res.write = function (chunk: any) {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          return true;
        } as any;

        res.end = function (this: ServerResponse, chunk?: any) {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          const resBodyStr = Buffer.concat(chunks).toString('utf8');
          let parsedBody: any = resBodyStr;
          try {
            parsedBody = JSON.parse(resBodyStr);
          } catch {
            // Keep as string
          }

          resolve({
            status: res.statusCode,
            headers: res.getHeaders(),
            body: parsedBody,
          });
          return this;
        } as any;

        (this.app as any).handle(req, res);

        if (bodyStr) {
          req.push(bodyStr);
        }
        req.push(null);
      } catch (err) {
        reject(err);
      }
    });

    return promise.then(onfulfilled, onrejected);
  }
}

export function createTestClient(app: Express) {
  return {
    get: (path: string) => new TestRequest(app, 'GET', path),
    post: (path: string) => new TestRequest(app, 'POST', path),
    put: (path: string) => new TestRequest(app, 'PUT', path),
    patch: (path: string) => new TestRequest(app, 'PATCH', path),
    delete: (path: string) => new TestRequest(app, 'DELETE', path),
  };
}
