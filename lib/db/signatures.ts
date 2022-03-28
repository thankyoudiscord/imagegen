import {Client} from 'pg';

import {User} from 'imagegen';

export class SignatureStore {
  constructor(readonly client: Client) {}

  async all(): Promise<User[]> {
    const {rows} = await this.client.query(`
        SELECT users.username, users.discriminator
        FROM signatures
        INNER JOIN users
        ON signatures.user_id = users.user_id
        ORDER BY signatures.created_at ASC
      `);

    return rows;
  }
}
