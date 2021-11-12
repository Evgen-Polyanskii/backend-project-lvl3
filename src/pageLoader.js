import fsp from 'fs/promises';
import axios from 'axios';
import process from 'process';
import _ from 'lodash';
import { getResources, updateHtml } from './utils.js';
import { getPathToHtmlFile, getPathToDirPage } from './PathsBuilder.js';
import resourcesLoader from './resourcesLoader.js';

const filterDomain = (path, pageURL) => {
  const urlResource = new URL(path, pageURL);
  return urlResource.hostname.includes(pageURL.hostname);
};

const pageLoader = (pageAddress, dirname = process.cwd()) => {
  const pageURL = new URL(pageAddress);
  const dirPage = getPathToDirPage(pageURL, dirname);
  let html;
  return axios.get(pageURL.href)
    .then((page) => {
      html = page.data;
      fsp.mkdir(dirPage);
    })
    .then(() => {
      const imgSrcs = getResources(html, 'img');
      const linkHrefs = _.filter(getResources(html, 'link'), (path) => filterDomain(path, pageURL));
      const scriptSrcs = _.filter(getResources(html, 'script'), (path) => filterDomain(path, pageURL));
      return _.uniq([...imgSrcs, ...linkHrefs, ...scriptSrcs]);
    })
    .then((resourcePaths) => resourcesLoader(resourcePaths, pageURL, dirPage))
    .then((assetMapPaths) => updateHtml(html, assetMapPaths))
    .then((updatedHtml) => {
      const pathToHtmlFile = getPathToHtmlFile(pageURL, dirname);
      fsp.writeFile(pathToHtmlFile, updatedHtml);
      return pathToHtmlFile;
    })
    .catch(console.log);
};

export default pageLoader;
