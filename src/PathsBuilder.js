import path from 'path';

const getPathFromAddress = (pageAddress) => pageAddress.replace(/\W/g, '-');

const getPathTo = (pageURL) => {
  const address = `${pageURL.hostname}${pageURL.pathname}`;
  return path.join(getPathFromAddress(address));
};

const urlToHtmlFilename = (pageURL) => `${getPathTo(pageURL)}.html`;

const urlToDirname = (pageURL) => `${getPathTo(pageURL)}_files`;

const getRelativePath = (resourcesPath, dirPage) => {
  const { dir, name, ext } = path.parse(resourcesPath);
  const fileExt = ext || '.html';
  const filepath = getPathFromAddress(path.join(`${dir}/${name}`));
  return path.join(dirPage, `${filepath}${fileExt}`);
};

const getAbsolutePath = (dirname, localPath) => path.join(dirname, localPath);

export {
  urlToHtmlFilename,
  urlToDirname,
  getAbsolutePath,
  getRelativePath,
};
