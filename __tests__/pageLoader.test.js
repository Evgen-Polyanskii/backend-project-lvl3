import nock from 'nock';
import fsp from 'fs/promises';
import path from 'path';
import os from 'os';
import prettier from 'prettier';
import pageLoader from '../src/pageLoader.js';
import { getFilePath, getFixture } from './utils.js';


nock.disableNetConnect();

const url = 'https://ru.hexlet.io/courses';
let dir;
let htmlBeforeChanges;
let htmlAfterChanges;

beforeAll(async () => {
  htmlBeforeChanges = await getFixture('before.html');
  htmlAfterChanges = prettier.format(await getFixture('after.html'), { parser: 'html' });
});
beforeEach(async () => {
  dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

describe('Проверка pageLoader', () => {
  it('замена ссылок на изображения в html', async () => {
    nock('https://ru.hexlet.io')
      .get(/\/courses/)
      .reply(200, htmlBeforeChanges);
    nock('https://ru.hexlet.io')
      .get('/assets/professions/nodejs.png')
      .reply(200, htmlBeforeChanges);
    const filepath = getFilePath(url, dir);
    await expect(pageLoader(url, dir)).resolves.not.toThrow();
    const actual = await fsp.readFile(filepath, 'utf-8');
    expect(prettier.format(actual, { parser: 'html' })).toEqual(htmlAfterChanges);
  });
});
