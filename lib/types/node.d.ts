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

      POSTGRES_HOST: string;
      POSTGRES_PORT: `${number}`;
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DB: string;

      SOURCE?: 'pg' | 'json';

      TAILWIND?: string;
    }
  }
}
