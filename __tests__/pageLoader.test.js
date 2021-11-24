import nock from 'nock';
import fsp from 'fs/promises';
import path from 'path';
import os from 'os';
import prettier from 'prettier';
import pageLoader from '../src/pageLoader.js';
import { getFilePath, getFixture } from './utils.js';

nock.disableNetConnect();

let resources = [
  {
    filename: 'ru-hexlet-io-assets-professions-nodejs.png',
    urlPath: '/assets/professions/nodejs.png',
    resourcePath: path.join('/resources', 'nodejs.png'),
  },
  {
    filename: 'ru-hexlet-io-packs-js-runtime.js',
    urlPath: '/packs/js/runtime.js',
    resourcePath: path.join('/resources', 'runtime.js'),
  },
  {
    filename: 'ru-hexlet-io-courses.html',
    urlPath: '/courses',
    resourcePath: path.join('/resources', 'courses.html'),
  },
  {
    filename: 'ru-hexlet-io-assets-application.css',
    urlPath: '/assets/application.css',
    resourcePath: path.join('/resources', 'application.css'),
  },
];
let dir;
let tmpDirPage;
let htmlBeforeLoading;
let htmlAfterLoading;
let filepath;
const url = 'https://ru.hexlet.io/courses';
const scope = nock('https://ru.hexlet.io');

beforeAll(async () => {
  htmlBeforeLoading = await getFixture('pageBeforeLoading.html');
  htmlAfterLoading = await getFixture('pageAfterLoading.html');
  const promisesReadResources = resources.map((resource) => getFixture(resource.resourcePath)
    .then((data) => ({ ...resource, data })));
  resources = await Promise.all(promisesReadResources);
  scope.get('/courses').reply(200, htmlBeforeLoading);
  resources.forEach(({ urlPath, data }) => scope.get(urlPath).reply(200, data));
});
beforeEach(async () => {
  dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  tmpDirPage = path.join(dir, 'ru-hexlet-io-courses_files');
  filepath = getFilePath(url, dir);
});

describe('Check pageLoader', () => {
  describe('positive cases', () => {
    it('load page', async () => {
      await expect(pageLoader(url, dir)).resolves.not.toThrow();
      resources.forEach(({ filename, data }) => {
        fsp.readFile(path.join(tmpDirPage, filename), 'utf-8')
          .then((actual) => expect(actual).toEqual(data));
      });
      const actual = await fsp.readFile(filepath, 'utf-8');
      expect(prettier.format(actual, { parser: 'html' })).toEqual(prettier.format(htmlAfterLoading, { parser: 'html' }));
    });
  });
  describe('negative cases', () => {
    it.each([404, 500])('load page: status code %s', async (code) => {
      scope.get(`/${code}`)
        .reply(code);
      await expect(pageLoader(new URL(`/${code}`, url).toString(), dir)).rejects.toThrow(`Request failed with status code ${code}`);
    });
    it('load page: file system errors', async () => {
      await expect(pageLoader(url, '/sys')).rejects.toThrow();
      await expect(pageLoader(url, `${dir}/home`)).rejects.toThrow();
    });
  });
});
