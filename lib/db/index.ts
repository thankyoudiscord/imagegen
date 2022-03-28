import {Client} from 'pg';

import {SignatureStore} from './signatures';

export class Database {
  signatures: SignatureStore;
  constructor(readonly client: Client) {
    this.signatures = new SignatureStore(client);
  }
}

export * from './signatures';
