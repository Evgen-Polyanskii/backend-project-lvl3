import path from 'path';

const changAddressToPath = (pageAddress) => pageAddress.replace(/[^a-zA-Z0-9]/g, '-');

const getPathToHtmlFile = (pageAddress, dirname) => {
  const pageURL = new URL(pageAddress);
  const address = `${pageURL.hostname}${pageURL.pathname}`;
  return `${dirname}/${changAddressToPath(address)}.html`;
};

const getPathToDirPage = (pageAddress, dirname) => {
  const pageURL = new URL(pageAddress);
  const address = `${pageURL.hostname}${pageURL.pathname}`;
  return `${dirname}/${changAddressToPath(address)}_files`;
};

const getAbsolutePathToImage = (src, pageAddress, dirname) => {
  const imgPath = path.parse(src);
  const dirPage = getPathToDirPage(pageAddress, dirname);
  const pageURL = new URL(pageAddress);
  return `${dirPage}/${changAddressToPath(`${pageURL.hostname}${imgPath.dir}`)}-${imgPath.base}`;
};

const getRelativePathToImage = (dirname, absolutePath) => absolutePath.replace(`${dirname}/`, '');

export {
  getPathToHtmlFile,
  getPathToDirPage,
  getAbsolutePathToImage,
  getRelativePathToImage,
};
