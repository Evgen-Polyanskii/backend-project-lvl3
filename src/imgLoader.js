import axios from 'axios';
import fsp from 'fs/promises';
import { getAbsolutePathToImage, getRelativePathToImage } from './PathsBuilder.js';

const imgLoader = (imageSrcs, pageURL, dirname) => {
  const promisesLoadImg = imageSrcs.map((imgSrc) => {
    const absolutePathToImg = getAbsolutePathToImage(imgSrc, pageURL, dirname);
    const urlImg = new URL(imgSrc, pageURL);
    return axios({
      method: 'get',
      url: urlImg.href,
      responseType: 'stream',
    })
      .then((response) => fsp.writeFile(absolutePathToImg, response.data))
      .then(() => getRelativePathToImage(dirname, absolutePathToImg))
      .then((path) => [imgSrc, path]);
  });
  return Promise.allSettled(promisesLoadImg).then((result) => result
    .filter(({ status }) => status === 'fulfilled')
    .map(({ value }) => Object.fromEntries([value])));
};

export default imgLoader;
