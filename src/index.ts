import {Server as GRPCServer, ServerCredentials} from '@grpc/grpc-js';
import 'dotenv/config';
import {Client as PGClient} from 'pg';

import {BannerService, Database, ImageGenerator} from 'imagegen';

import {generateBanner} from './services/banner';

const wid = parseInt(process.env.IMAGE_WIDTH);
const hei = parseInt(process.env.IMAGE_HEIGHT);

const DEFAULT_ADDR = '127.0.0.1:3000';

const REQUIRED_ENV = [
  'IMAGE_WIDTH',
  'IMAGE_HEIGHT',
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
];
const missing = [];
for (const req of REQUIRED_ENV) {
  if (!process.env[req]) {
    missing.push(req);
  }
}

if (missing.length) {
  throw new Error(`Missing ${missing.map(r => `\`${r}\``).join(', ')} in env`);
}

const generator = new ImageGenerator(wid, hei);
const main = async () => {
  await generator.init();

  const pgClient = new PGClient({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });

  await pgClient.connect().then(() => console.log('Connected to Postgres'));

  const db = new Database(pgClient);

  const server = new GRPCServer();
  server.addService(BannerService, {
    generateBanner: generateBanner(db, generator),
  });

  server.bindAsync(
    process.env.ADDR || DEFAULT_ADDR,
    ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.log('Failed to open gRPC server:', err);
        throw err;
      }

      console.log('Server bound to port:', port);

      server.start();
    }
  );
};

main().catch(console.error);

process.stdin.resume();
process.on('SIGINT', async () => {
  await generator.close();
  process.exit(0); // eslint-disable-line no-process-exit
});

// lol
const {emitWarning} = process;
process.emitWarning = (warning, ...args) => {
  if (args[0] === 'ExperimentalWarning') {
    return;
  }
  return emitWarning(warning, ...args);
};
