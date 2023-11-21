import { createServer } from 'http';
import { parse } from 'querystring';
import { account } from './endpoints/account';
import { category } from './endpoints/category';
import { product } from './endpoints/product';
import { project } from './endpoints/project';
import { recipient } from './endpoints/recipient';
import { transaction } from './endpoints/transaction';
import { config } from 'dotenv';

config();

export type EndpointConfig = {
  regex: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  handler: string;
  pathParameters?: {
    [parameterName: string]: number;
  };
};

const endpoints: EndpointConfig[] = [
  ...account,
  ...category,
  ...product,
  ...project,
  ...recipient,
  ...transaction,
];

const server = createServer((req, res) => {
  const bodyChunks: any[] = [];
  req.on('data', chunk => {
    bodyChunks.push(chunk);
  });

  req.on('end', async () => {
    const [
      url,
      queryStringParameters,
    ] = req.url.split('?');
    let pathParameters = {};

    const endpoint = endpoints.find(e => url.match(`^${e.regex}$`) && e.method === req.method);

    if (!endpoint) {
      res.writeHead(404);
      res.end();
      return;
    }

    if (endpoint.pathParameters) {
      const urlParts = url.split('/');
      pathParameters = Object.entries(endpoint.pathParameters).reduce((accumulator, [
        parameterName,
        index,
      ]) => {
        return {
          ...accumulator,
          [parameterName]: urlParts[index],
        };
      }, {});
    }

    const handler = (await import(`../dist/api/${endpoint.handler}/index`)).default;
    const result = await handler({
      body: Buffer.concat(bodyChunks).toString(),
      headers: req.headers,
      queryStringParameters: {
        ...parse(queryStringParameters),
      },
      pathParameters,
    }, {}, undefined);

    res.writeHead(result.statusCode, {
      'content-type': 'application/json',
      ...result.headers,
    });
    res.write(result.body);
    res.end();
  });
});

console.log('listening on port 5050');
server.listen(5050);
