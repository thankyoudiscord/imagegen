import * as ejs from 'ejs';
import {readFile, readdir} from 'fs/promises';
import {Browser, Page, chromium} from 'playwright';
import {fetch} from 'undici';

import path = require('path');

// sometimes I work on this offline and it's nice to be able to serve tailwind
// locally and not have to redownload it with each restart :P
const TAILWIND_CDN = process.env.TAILWIND || 'https://cdn.tailwindcss.com';

export interface User {
  username: string;
  discriminator: string;
}

export class ImageGenerator {
  #browser?: Browser;
  #page?: Page;

  #tailwind?: string;
  #ejs?: string;
  #assets?: {bg: string; fonts: string};

  constructor(readonly width: number, readonly height: number) {}

  /**
   * Initializes the ImageGenerator by doing the following:
   * - reading and inlining all assets and font files
   * - reading ejs template file
   * - downloading tailwind
   * - launching the headless browser
   */
  async init() {
    // create the browser page
    this.#browser = await chromium.launch();
    const ctx = await this.#browser.newContext({
      viewport: {
        height: this.height,
        width: this.width,
      },
    });
    this.#page = await ctx.newPage();

    // download tailwind from the CDN
    this.#tailwind = await fetch(TAILWIND_CDN).then(res => res.text());

    // load assets
    const fonts = await generateFontStyles();
    const bg = await readFile(path.join(process.cwd(), './assets/img/bg.svg'), {
      encoding: 'utf8',
    });

    this.#assets = {bg, fonts};

    // read the ejs template
    this.#ejs = await readFile(path.join(process.cwd(), './template.ejs'), {
      encoding: 'utf8',
    });
  }

  // TODO: use createNewPage() in screenshot()?

  /**
   * An internal method for creating a page. Mostly used for testing purposes
   * @param users the data of the users to embed in the page
   * @returns the created page (don't forget to call page.close())
   */
  async createNewPage(
    viewport: {width: number; height: number},
    users: User[]
  ): Promise<Page> {
    if (!this.#ejs || !this.#assets || !this.#tailwind || !this.#browser) {
      throw new Error('ImageGenerator not initializzed');
    }

    const ctx = await this.#browser.newContext({
      viewport,
    });

    const page = await ctx.newPage();

    const html = ejs.render(this.#ejs, {
      bg: this.#assets?.bg,
      users,
    });

    await page.setContent(html);
    await page.addScriptTag({content: this.#tailwind});
    await page.addStyleTag({content: this.#assets.fonts});

    return page;
  }

  /** Closes the page and headless browser */
  async close() {
    await this.#page?.close();
    await this.#browser?.close();
  }

  /**
   * Generates an image based off the tempate with the provided users.
   *
   * @param users data of the users to include in the generated image
   * @returns the generated image
   */
  async screenshot(users: User[]): Promise<Buffer> {
    if (!this.#ejs || !this.#assets || !this.#page || !this.#tailwind) {
      throw new Error('ImageGenerator not initializzed');
    }

    const html = ejs.render(this.#ejs, {
      bg: this.#assets?.bg,
      users,
    });

    await this.#page.setContent(html);
    await this.#page.addScriptTag({content: this.#tailwind});
    await this.#page.addStyleTag({content: this.#assets.fonts});
    const screenshot = await this.#page.screenshot({
      fullPage: true,
      omitBackground: true,
      type: 'png',
    });

    return screenshot;
  }
}

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

  const classes = [
    '.font-ginto {font-family: Ginto Nord, sans-serif;}',
    '.font-whitney {font-family: Whitney, serif, sans-serif;}',
  ].join('\n');

  const out = [...gintoFonts, whitneyFonts, classes].join('\n');

  return out;
};
