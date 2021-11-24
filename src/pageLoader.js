import fsp from 'fs/promises';
import path from 'path';
import process from 'process';
import Listr from 'listr';
import { updateHtml, load, makeDir } from './utils.js';
import { urlToHtmlFilename, urlToDirname, getAbsolutePath } from './PathsBuilder.js';
import debug from './logger.js';

const pageLoader = (pageAddress, dirname = process.cwd()) => {
  debug('Address of the requested page', pageAddress);
  let pageURL;
  try {
    pageURL = new URL(pageAddress);
  } catch (e) {
    return Promise.reject(e);
  }
  const pathToHtmlFile = path.join(dirname, urlToHtmlFilename(pageURL));
  const dirPage = urlToDirname(pageURL);
  const pathToDirPage = path.join(dirname, dirPage);
  debug(`Create page directory ${dirPage}`);
  return makeDir(pathToDirPage)
    .then(() => load(pageURL.toString()))
    .then((page) => {
      const { html, assets } = updateHtml(page, pageURL, dirPage);
      debug('Resource paths %O', assets);
      debug('Create html file', pathToHtmlFile);
      return fsp.writeFile(pathToHtmlFile, html).then(() => assets);
    })
    .then((assetMapPaths) => {
      const promisesLoadResource = assetMapPaths.map(({ relativePath, URL }) => {
        const absolutePath = getAbsolutePath(dirname, relativePath);
        debug(`Get resources ${URL}`);
        return {
          title: `load ${URL}`,
          task: () => load(URL).then((response) => fsp.writeFile(absolutePath, response)),
        };
      });
      const tasks = new Listr(promisesLoadResource, { concurrent: true, exitOnError: false });
      return tasks.run();
    })
    .then(() => pathToHtmlFile);
};

export default pageLoader;
