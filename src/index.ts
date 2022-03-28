import {Server as GRPCServer, ServerCredentials} from '@grpc/grpc-js';

import {BannerService, ImageGenerator} from 'imagegen';

import {generateBanner} from './services/banner';

const wid = parseInt(process.env.IMAGE_WIDTH);
const hei = parseInt(process.env.IMAGE_HEIGHT);

const REQUIRED_ENV = ['ADDR', 'IMAGE_WIDTH', 'IMAGE_HEIGHT'];
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

  const server = new GRPCServer();
  server.addService(BannerService, {
    generateBanner: generateBanner(generator),
  });

  server.bindAsync(
    process.env.ADDR,
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
});

// lol
const {emitWarning} = process;
process.emitWarning = (warning, ...args) => {
  if (args[0] === 'ExperimentalWarning') {
    return;
  }
  return emitWarning(warning, ...args);
};
