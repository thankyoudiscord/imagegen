import '@types/node';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** the port for the gRPC server */
      PORT: `${number}`;
    }
  }
}
