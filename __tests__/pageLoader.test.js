import nock from 'nock';
import fsp from 'fs/promises';
import path from 'path';
import os from 'os';
import prettier from 'prettier';
import pageLoader from '../src/pageLoader.js';
import { getFilePath, getFixture, hasFileExists } from './utils.js';

nock.disableNetConnect();

const url = 'https://ru.hexlet.io/courses';
const resources = [
  'ru-hexlet-io-assets-professions-nodejs.png',
  'ru-hexlet-io-packs-js-runtime.js',
  'ru-hexlet-io-courses.html',
  'ru-hexlet-io-assets-application.css',
];
let dir;
let tmpDirPage;
let htmlBeforeChanges;
let htmlAfterChanges;
let filepath;
let scope;

beforeAll(async () => {
  htmlBeforeChanges = await getFixture('before.html');
  htmlAfterChanges = await getFixture('after.html');
});
beforeEach(async () => {
  dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  tmpDirPage = path.join(dir, 'ru-hexlet-io-courses_files');
  filepath = getFilePath(url, dir);
  scope = nock('https://ru.hexlet.io');
});

describe('Check pageLoader', () => {
  describe('positive cases', () => {
    it('load page', async () => {
      scope.get(/\/courses/)
        .reply(200, htmlBeforeChanges)
        .get('/assets/professions/nodejs.png')
        .reply(200)
        .get('/packs/js/runtime.js')
        .reply(200)
        .get('/assets/application.css')
        .reply(200)
        .get(/\/courses/)
        .reply(200);
      await expect(pageLoader(url, dir)).resolves.not.toThrow();
      const createdFiles = resources.filter((filename) => hasFileExists(tmpDirPage, filename));
      expect(createdFiles).toHaveLength(resources.length);
      const actual = await fsp.readFile(filepath, 'utf-8');
      expect(prettier.format(actual, { parser: 'html' })).toEqual(prettier.format(htmlAfterChanges, { parser: 'html' }));
    });
  });
  describe('negative cases', () => {
    it.each([404, 500])('load page: status code %s', async (code) => {
      scope.get(/\/courses/)
        .reply(code);
      await expect(pageLoader(url, dir)).rejects.toThrow(`Request failed with status code ${code}`);
    });
    it('load page: file system errors', async () => {
      scope.get(/\/courses/)
        .reply(200, htmlBeforeChanges)
        .get(/\/courses/)
        .reply(200, htmlBeforeChanges);
      await expect(pageLoader(url, '/sys')).rejects.toThrow();
    });
  });
});
