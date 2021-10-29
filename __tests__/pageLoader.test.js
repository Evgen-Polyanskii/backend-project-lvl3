import nock from 'nock';
import fsp from 'fs/promises';
import path from 'path';
import os from 'os';
import pageLoader from '../src/pageLoader';
import getFilePath from './utils.js';

nock.disableNetConnect();

let dir;

beforeEach(async () => {
  dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

describe('Проверка pageLoader', () => {
  nock(/ru\.hexlet\.io/)
    .get(/courses/)
    .reply(200, '<p>Hello world!</p>');
  it('с переданной директорией', async () => {
    const url = 'https://ru.hexlet.io/courses';
    const filepath = getFilePath(url, dir);
    await expect(pageLoader(url, dir)).resolves.not.toThrow();
    await expect(fsp.readFile(filepath, 'utf-8')).resolves.toEqual('<p>Hello world!</p>');
  });
});
