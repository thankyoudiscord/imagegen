import {readFile, writeFile} from 'fs/promises';

import {ImageGenerator, User} from 'imagegen';

const main = async () => {
  const generator = new ImageGenerator(1800, 600);
  await generator.init();

  const usersFile = await readFile('./users.json', 'utf8');
  const users = (JSON.parse(usersFile) as User[]).slice(0, 400);

  const ss = await generator.screenshot(users);

  await writeFile(`./out-${new Date().toISOString()}.png`, ss);

  await generator.close();
};

main().catch(console.error);

// lol
const {emitWarning} = process;
process.emitWarning = (warning, ...args) => {
  if (args[0] === 'ExperimentalWarning') {
    return;
  }
  return emitWarning(warning, ...args);
};
