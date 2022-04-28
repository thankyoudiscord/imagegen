const users = require('../users.json');
const {ImageGenerator} = require('../build/lib/generate');
const {writeFileSync} = require('fs');

const WIDTH = 5300;
const HEIGHT = 1800;

const gen = new ImageGenerator(WIDTH, HEIGHT);
const main = async () => {
  await gen.init();

  const viewport = {
    width: WIDTH,
    height: HEIGHT,
  };

  const page = await gen.createNewPage(viewport, users);
  const html = await page.content();
  writeFileSync('out.html', html);

  await page.screenshot({
    fullPage: true,
    omitBackground: true,
    type: 'png',
    path: './out.png',
  });
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
