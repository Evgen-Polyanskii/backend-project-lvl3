import fsp from 'fs/promises';
import axios from 'axios';
import process from 'process';

const getFilePath = (page, dirname) => {
  const pageURL = new URL(page);
  const filename = `${pageURL.hostname}${pageURL.pathname}`
    .replace(/[^a-zA-Z0-9]/g, '-');
  return `${dirname}/${filename}.html`;
};

const pageLoader = (pageURL, dirname = process.cwd()) => {
  const filepath = getFilePath(pageURL, dirname);
  return axios.get(pageURL)
    .then((page) => fsp.writeFile(filepath, page.data))
    .then(() => filepath)
    .catch(console.log);
};
export default pageLoader;
