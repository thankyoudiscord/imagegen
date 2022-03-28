import '@types/node';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** the port for the gRPC server */
      ADDR: string;
      /** the width of the image */
      IMAGE_WIDTH: `${number}`;
      /** the height of the image */
      IMAGE_HEIGHT: `${number}`;
    }
  }
}
