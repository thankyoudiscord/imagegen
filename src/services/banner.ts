import {ServerUnaryCall, sendUnaryData} from '@grpc/grpc-js';
import {readFile} from 'fs/promises';

import {
  CreateBannerRequest,
  CreateBannerResponse,
  Database,
  ImageGenerator,
  User,
} from 'imagegen';

export const generateBanner =
  (db: Database, gen: ImageGenerator) =>
  async (
    _call: ServerUnaryCall<CreateBannerRequest, CreateBannerResponse>,
    cb: sendUnaryData<CreateBannerResponse>
  ) => {
    const resp = new CreateBannerResponse();

    let users: User[] = [];

    if (process.env?.SOURCE === 'json') {
      const usersFile = await readFile('./users.json', 'utf8');
      users = (JSON.parse(usersFile) as User[]).slice(0, 400);
    } else {
      users = await db.signatures.allUsers();
    }

    const ss = await gen.screenshot(users);

    resp.setImage(ss);
    resp.setGeneratedAt(new Date().toISOString());

    return cb(null, resp);
  };
