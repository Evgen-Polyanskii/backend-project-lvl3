import fsp from 'fs/promises';
import axios from 'axios';
import process from 'process';
import { getImgSrcs, updateHtml } from './utils.js';
import { getPathToHtmlFile, getPathToDirPage } from './PathsBuilder.js';
import imgLoader from './imgLoader.js';

const pageLoader = (pageURL, dirname = process.cwd()) => {
  const dirPage = getPathToDirPage(pageURL, dirname);
  let html;
  return axios.get(pageURL)
    .then((page) => {
      html = page.data;
      fsp.mkdir(dirPage);
    })
    .then(() => getImgSrcs(html))
    .then((imagesSrc) => imgLoader(imagesSrc, pageURL, dirname))
    .then((imgPaths) => updateHtml(html, imgPaths))
    .then((updatedHtml) => {
      const pathToHtmlFile = getPathToHtmlFile(pageURL, dirname);
      fsp.writeFile(pathToHtmlFile, updatedHtml);
      return pathToHtmlFile;
    })
    .catch(console.log);
};

export default pageLoader;
