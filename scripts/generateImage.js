const users = require('../users.json');
const {ImageGenerator} = require('../build/lib');
const {writeFileSync} = require('fs');

const WIDTH = 1800;
const HEIGHT = 600;

const gen = new ImageGenerator(WIDTH, HEIGHT);
const main = async () => {
  await gen.init();
  const img = await gen.screenshot(users);

  writeFileSync('out.png', img);
};

main()
  .catch(console.error)
  .finally(() => gen.close());

const {emitWarning} = process;
process.emitWarning = (warning, ...args) => {
  if (args[0] === 'ExperimentalWarning') {
    return;
  }
  return emitWarning(warning, ...args);
};
