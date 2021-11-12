import nock from 'nock';
import fsp from 'fs/promises';
import path from 'path';
import os from 'os';
import resourcesLoader from '../src/resourcesLoader.js';

nock.disableNetConnect();

const url = new URL('https://ru.hexlet.io/courses');
let dir;

beforeEach(async () => {
  dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

it('Проверка imgLoader', async () => {
  const resources = ['/assets/professions/nodejs.png', 'https://ru.hexlet.io/packs/js/runtime.js'];
  const requestImg = nock('https://ru.hexlet.io')
    .get('/assets/professions/nodejs.png')
    .reply(200);
  const requestScript = nock('https://ru.hexlet.io')
    .get('/packs/js/runtime.js')
    .reply(200);
  await resourcesLoader(resources, url, dir);
  expect(requestImg.isDone()).toBe(true);
  expect(requestScript.isDone()).toBe(true);
});
