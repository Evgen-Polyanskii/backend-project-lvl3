import { fileURLToPath } from 'url';
import fsp from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const getFixturePath = (paths) => path.join(__dirname, '..', '__fixtures__', paths);
const readFile = async (filePath) => fsp.readFile(filePath, 'utf8');
const getFixture = (paths) => readFile(getFixturePath(paths));

const getFilePath = (page, dirname) => {
  const pageURL = new URL(page);
  const filename = `${pageURL.hostname}${pageURL.pathname}`
    .replace(/[^a-zA-Z0-9]/g, '-');
  return `${dirname}/${filename}.html`;
};

export { getFilePath, getFixture };
