import axios from 'axios';
import fsp from 'fs/promises';
import { getAbsolutePathToFile, getRelativePathToFile } from './PathsBuilder.js';

const resourcesLoader = (resourcePaths, pageURL, dirPage) => {
  const promisesLoadResource = resourcePaths.map((path) => {
    const urlResource = new URL(path, pageURL);
    const absolutePathToFile = getAbsolutePathToFile(urlResource, dirPage);
    return axios({
      method: 'get',
      url: urlResource.href,
      responseType: 'stream',
    })
      .then((response) => fsp.writeFile(absolutePathToFile, response.data))
      .then(() => getRelativePathToFile(dirPage, absolutePathToFile))
      .then((relativePath) => [path, relativePath]);
  });
  return Promise.allSettled(promisesLoadResource).then((result) => {
    const promisesValue = result.filter(({ status }) => status === 'fulfilled')
      .map(({ value }) => value);
    return Object.fromEntries(promisesValue);
  });
};

export default resourcesLoader;
