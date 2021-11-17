import fsp from 'fs/promises';
import axios from 'axios';
import process from 'process';
import Listr from 'listr';
import { getResources, updateHtml } from './utils.js';
import { getPathToHtmlFile, getPathToDirPage } from './PathsBuilder.js';
import resourcesLoader from './resourcesLoader.js';
import debug from './logger.js';

const pageLoader = (pageAddress, dirname = process.cwd()) => {
  debug('Address of the requested page', pageAddress);
  const tasks = new Listr([], { concurrent: true });
  const pageURL = new URL(pageAddress);
  const pathToHtmlFile = getPathToHtmlFile(pageURL, dirname);
  const dirPage = getPathToDirPage(pageURL, dirname);
  let html;
  const loadedPage = axios.get(pageAddress);
  tasks.add({ title: `Load ${pageAddress}`, task: () => loadedPage });
  return loadedPage
    .then((page) => {
      html = page.data;
      const createDir = fsp.mkdir(dirPage);
      debug(`Create page directory ${dirPage}`);
      tasks.add({ title: 'Create page directory', task: () => createDir });
      return createDir;
    })
    .then(() => {
      const resources = getResources(html);
      tasks.add({ title: 'Getting resources', task: () => resources });
      return resources;
    })
    .then((resourcePaths) => {
      const loadResources = resourcesLoader(resourcePaths, pageURL, dirPage);
      tasks.add({ title: 'Download resources', task: () => loadResources });
      return loadResources;
    })
    .then((assetMapPaths) => {
      debug('Resource paths %O', assetMapPaths);
      return updateHtml(html, assetMapPaths);
    })
    .then((updatedHtml) => {
      tasks.add({ title: 'Create html file', task: () => fsp.writeFile(pathToHtmlFile, updatedHtml) });
      debug('Path to the html file', pathToHtmlFile);
      return tasks.run();
    })
    .then(() => pathToHtmlFile);
};

export default pageLoader;
