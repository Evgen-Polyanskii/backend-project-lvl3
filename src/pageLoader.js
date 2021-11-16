import fsp from 'fs/promises';
import axios from 'axios';
import process from 'process';
import { getResources, updateHtml } from './utils.js';
import { getPathToHtmlFile, getPathToDirPage } from './PathsBuilder.js';
import resourcesLoader from './resourcesLoader.js';
import debug from './logger.js';

const pageLoader = (pageAddress, dirname = process.cwd()) => {
  const pageURL = new URL(pageAddress);
  debug('Адресс запрашиваемой страницы', pageAddress);
  const dirPage = getPathToDirPage(pageURL, dirname);
  let html;
  debug(`Создаваемая директория для хранения файлов страницы ${dirPage}`);
  return axios.get(pageURL.href)
    .then((page) => {
      html = page.data;
      fsp.mkdir(dirPage);
    })
    .then(() => getResources(html))
    .then((resourcePaths) => resourcesLoader(resourcePaths, pageURL, dirPage))
    .then((assetMapPaths) => {
      debug('Исходные и новые пути ресурсов %O', assetMapPaths);
      return updateHtml(html, assetMapPaths);
    })
    .then((updatedHtml) => {
      const pathToHtmlFile = getPathToHtmlFile(pageURL, dirname);
      fsp.writeFile(pathToHtmlFile, updatedHtml);
      debug('Путь до html файла', pathToHtmlFile);
      return pathToHtmlFile;
    })
    .catch(console.log);
};

export default pageLoader;
