import fsp from 'fs/promises';
import axios from 'axios';
import process from 'process';
import { getResources, updateHtml } from './utils.js';
import { getPathToHtmlFile, getPathToDirPage } from './PathsBuilder.js';
import resourcesLoader from './resourcesLoader.js';
import debug from './logger.js';

const pageLoader = (pageAddress, dirname = process.cwd()) => {
  debug('Address of the requested page', pageAddress);
  let pageURL;
  let dirPage;
  let html;
  return axios.get(pageAddress)
    .then((page) => {
      html = page.data;
      pageURL = new URL(pageAddress);
      dirPage = getPathToDirPage(pageURL, dirname);
      debug(`Create page directory ${dirPage}`);
      return fsp.mkdir(dirPage);
    })
    .then(() => getResources(html))
    .then((resourcePaths) => resourcesLoader(resourcePaths, pageURL, dirPage))
    .then((assetMapPaths) => {
      debug('Resource paths %O', assetMapPaths);
      return updateHtml(html, assetMapPaths);
    })
    .then((updatedHtml) => {
      const pathToHtmlFile = getPathToHtmlFile(pageURL, dirname);
      fsp.writeFile(pathToHtmlFile, updatedHtml);
      debug('Path to the html file', pathToHtmlFile);
      return pathToHtmlFile;
    });
};

export default pageLoader;
