import {ServerUnaryCall, sendUnaryData} from '@grpc/grpc-js';
import {readFile} from 'fs/promises';

import {
  CreateBannerRequest,
  CreateBannerResponse,
  ImageGenerator,
  User,
} from 'imagegen';

export const generateBanner =
  (gen: ImageGenerator) =>
  async (
    _call: ServerUnaryCall<CreateBannerRequest, CreateBannerResponse>,
    cb: sendUnaryData<CreateBannerResponse>
  ) => {
    const resp = new CreateBannerResponse();

    const usersFile = await readFile('./users.json', 'utf8');
    const users = (JSON.parse(usersFile) as User[]).slice(0, 400);

    const ss = await gen.screenshot(users);

    resp.setImage(ss);
    resp.setGeneratedAt(new Date().toISOString());

    return cb(null, resp);
  };
