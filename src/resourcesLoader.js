import axios from 'axios';
import fsp from 'fs/promises';
import { getAbsolutePathToFile, getRelativePathToFile } from './PathsBuilder.js';
import debug from './logger.js';

const filterDomain = (path, pageURL) => {
  const urlResource = new URL(path, pageURL);
  return urlResource.hostname.includes(pageURL.hostname);
};

const resourcesLoader = (resourcePaths, pageURL, dirPage) => {
  debug('List of resources %O', resourcePaths);
  const promisesLoadResource = resourcePaths.filter((path) => filterDomain(path, pageURL))
    .map((path) => {
      const urlResource = new URL(path, pageURL);
      debug(`Resource URL ${urlResource.href}`);
      const absolutePathToFile = getAbsolutePathToFile(urlResource, dirPage);
      return axios({
        method: 'get',
        url: urlResource.href,
        responseType: 'arraybuffer',
      })
        .then((response) => {
          debug(`Writing a resource to a file ${absolutePathToFile}`);
          return fsp.writeFile(absolutePathToFile, response.data);
        })
        .then(() => getRelativePathToFile(dirPage, absolutePathToFile))
        .then((relativePath) => {
          debug(`Relative path to the resource ${relativePath}`);
          return [path, relativePath];
        });
    });
  return Promise.allSettled(promisesLoadResource).then((result) => {
    debug('Result of resource loading %O', result);
    const promisesValue = result.filter(({ status }) => status === 'fulfilled')
      .map(({ value }) => value);
    return Object.fromEntries(promisesValue);
  });
};

export default resourcesLoader;
