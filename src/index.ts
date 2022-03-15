import {chromium} from 'playwright';
import {fetch} from 'undici';

import {readdir, readFile, writeFile} from 'fs/promises';
import path = require('path');

const FONT_CLASSES = [
  '.font-ginto {font-family: Ginto Nord, sans-serif;}',
  '.font-whitney {font-family: Whitney, serif, sans-serif;}',
].join('\n');

const main = async () => {
  const styles = await generateFontStyles();
  const tailwind = await getTailwind();

  const html = await readFile(path.join(process.cwd(), './test.html'), {
    encoding: 'utf8',
  });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    // viewport: {height: 2160, width: 3840}, // 4k
    viewport: {height: 1080, width: 1920}, // 1080
  });
  const page = await ctx.newPage();

  const times: number[] = [];

  const takeScreenshot = async (id: number) => {
    const before = Date.now();

    await page.setContent(html.replace('{{id}}', id.toString()));
    await page.addScriptTag({content: tailwind});
    await page.addStyleTag({content: styles});
    await page.addStyleTag({content: FONT_CLASSES});
    const screenshot = await page.screenshot({
      fullPage: true,
      omitBackground: true,
      type: 'png',
    });

    const after = Date.now();

    const diff = after - before;
    times.push(diff);

    console.log(`screenshot ${id} took ${diff}ms`);
    await writeFile(`out-${id}.png`, screenshot);
  };

  for (let i = 0; i < 1; i++) {
    await takeScreenshot(i);
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(
    `avg time per screenshot: ${avgTime}ms with ${times.length} samples`
  );

  await writeFile('./out.html', await page.content());
  await page.close();
  await browser.close();
};

const getTailwind = async () => {
  const TAILWIND_CDN = 'https://cdn.tailwindcss.com';

  return fetch(TAILWIND_CDN).then(r => r.text());
};

const generateFontStyles = async () => {
  const filePath = (file = '') =>
    path.join(process.cwd(), './assets/fonts', file);

  const woffToDataURI = async (file: string) => {
    const b64 = await readFile(file, {
      encoding: 'base64',
    });
    return `data:application/font-woff;base64,${b64}`;
  };

  const fontFaceForGintoFile = async (file: string): Promise<string> => {
    const dataURI = await woffToDataURI(path.join(filePath('ginto'), file));
    const [, weight, style] = /^([a-z0-9]+)_([a-z0-9]+)\.woff$/g.exec(file)!;

    const fontFace = `@font-face {\n${Object.entries({
      'font-family': 'Ginto Nord',
      'font-display': 'swap',
      'font-weight': weight,
      'font-style': style,
      src: `url('${dataURI}') format('woff')`,
    })
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n')}\n}`;

    return fontFace;
  };

  const fontFaceForWhitneyFile = async (file: string) => {
    return woffToDataURI(path.join(filePath('whitney'), file));
  };

  const getFontFiles = (fontName: string) =>
    readdir(filePath(fontName)).then(f => f.filter(fo => fo.endsWith('.woff')));

  const gintoFonts = await Promise.all(
    await getFontFiles('ginto').then(f => f.map(fontFaceForGintoFile))
  );

  const whitneyAsBase64 = await Promise.all(
    await getFontFiles('whitney').then(f => f.map(fontFaceForWhitneyFile))
  );

  const whitneyFonts = `@font-face {\n${Object.entries({
    'font-family': 'Whitney',
    src: whitneyAsBase64.map(w => `url('${w}')`).join(', '),
  })
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}`;

  const out = [...gintoFonts, whitneyFonts].join('\n');

  await writeFile('out.css', out);

  return out;
};

main().catch(console.error);

const {emitWarning} = process;
process.emitWarning = (warning, ...args) => {
  if (args[0] === 'ExperimentalWarning') {
    return;
  }
  return emitWarning(warning, ...args);
};
