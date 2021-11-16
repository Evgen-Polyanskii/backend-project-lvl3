import axios from 'axios';
import fsp from 'fs/promises';
import { getAbsolutePathToFile, getRelativePathToFile } from './PathsBuilder.js';
import debug from './logger.js';

const filterDomain = (path, pageURL) => {
  const urlResource = new URL(path, pageURL);
  return urlResource.hostname.includes(pageURL.hostname);
};

const resourcesLoader = (resourcePaths, pageURL, dirPage) => {
  debug('Список ресурсов %O', resourcePaths);
  const promisesLoadResource = resourcePaths.filter((path) => filterDomain(path, pageURL))
    .map((path) => {
      const urlResource = new URL(path, pageURL);
      debug(`URL получаемого ресурса ${urlResource.href}`);
      const absolutePathToFile = getAbsolutePathToFile(urlResource, dirPage);
      return axios({
        method: 'get',
        url: urlResource.href,
        responseType: 'stream',
      })
        .then((response) => {
          debug(`Запись ресурса в файл ${absolutePathToFile}`);
          return fsp.writeFile(absolutePathToFile, response.data);
        })
        .then(() => getRelativePathToFile(dirPage, absolutePathToFile))
        .then((relativePath) => {
          debug(`Относительный путь до ресурса ${relativePath}`);
          return [path, relativePath];
        });
    });
  return Promise.allSettled(promisesLoadResource).then((result) => {
    debug('Результат загрузки ресурсов %O', result);
    const promisesValue = result.filter(({ status }) => status === 'fulfilled')
      .map(({ value }) => value);
    return Object.fromEntries(promisesValue);
  });
};

export default resourcesLoader;
