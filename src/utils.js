import fsp from 'fs/promises';
import cheerio from 'cheerio';
import axios from 'axios';
import { getRelativePath } from './PathsBuilder.js';

const load = (uri) => axios.get(uri, { responseType: 'arraybuffer' })
  .then(({ data }) => data);

const filterDomain = (path, pageURL) => {
  const resourceURL = new URL(path, pageURL);
  return resourceURL.hostname === pageURL.hostname;
};

const updateHtml = (html, pageURL, dirPage) => {
  const $ = cheerio.load(html);
  const hrefAttrs = {
    script: 'src',
    link: 'href',
    img: 'src',
  };
  const assets = Object.entries(hrefAttrs).flatMap(([tag, attr]) => {
    const localPaths = $(`${tag}[${attr}]`).toArray().filter((el) => {
      const path = $(el).attr(attr);
      return filterDomain(path, pageURL) && !path.startsWith('data:');
    });
    return localPaths.map((el) => {
      const uriPath = $(el).attr(attr);
      const url = new URL(uriPath, pageURL);
      const relativePath = getRelativePath(`${url.hostname}${url.pathname}`, dirPage);
      $(el).attr(attr, relativePath);
      return {
        relativePath,
        URL: url.toString(),
      };
    });
  });
  return { html: $.html(), assets };
};

const makeDir = (pathToDirPage) => fsp.access(pathToDirPage)
  .catch(() => fsp.mkdir(pathToDirPage));

export { updateHtml, load, makeDir };
