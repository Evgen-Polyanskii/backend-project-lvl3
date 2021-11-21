import { fileURLToPath } from 'url';
import fsp from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = async (filePath) => fsp.readFile(filePath, 'utf8');
const getFixture = (fileName) => readFile(getFixturePath(fileName));

const getFilePath = (page, dirname) => {
  const pageURL = new URL(page);
  const filename = `${pageURL.hostname}${pageURL.pathname}`
    .replace(/[^a-zA-Z0-9]/g, '-');
  return `${dirname}/${filename}.html`;
};

const hasFileExists = async (dirname, filename) => {
  const filesInDir = await fsp.readdir(dirname);
  return filesInDir.includes(filename);
};

export { getFilePath, getFixture, hasFileExists };
