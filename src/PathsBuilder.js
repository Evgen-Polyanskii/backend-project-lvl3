import path from 'path';

const getPathFromAddress = (pageAddress) => pageAddress.replace(/[^a-zA-Z0-9]/g, '-');

const getPathToHtmlFile = (pageURL, dirname) => {
  const address = `${pageURL.hostname}${pageURL.pathname}`;
  return `${dirname}/${getPathFromAddress(address)}.html`;
};

const getPathToDirPage = (pageURL, dirname) => {
  const address = `${pageURL.hostname}${pageURL.pathname}`;
  return `${dirname}/${getPathFromAddress(address)}_files`;
};

const getAbsolutePathToFile = (url, dirPage) => {
  const urlPath = path.parse(url.pathname);
  const fileExt = urlPath.ext ? urlPath.ext : '.html';
  const newPath = url.pathname.replace(fileExt, '');
  const filepath = getPathFromAddress(`${url.hostname}${newPath}`);
  return `${dirPage}/${filepath}${fileExt}`;
};

const getRelativePathToFile = (dirPage, absolutePath) => absolutePath.replace(`${path.dirname(dirPage)}/`, '');

export {
  getPathToHtmlFile,
  getPathToDirPage,
  getAbsolutePathToFile,
  getRelativePathToFile,
};
