import nock from 'nock';
import fsp from 'fs/promises';
import path from 'path';
import os from 'os';
import imgLoader from '../src/imgLoader.js';

nock.disableNetConnect();

const url = 'https://ru.hexlet.io/courses';
let dir;

beforeEach(async () => {
  dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

it('Проверка imgLoader', async () => {
  const imgSrc = '/assets/professions/nodejs.png';
  const request = nock('https://ru.hexlet.io')
    .get(imgSrc)
    .reply(200);
  await imgLoader([imgSrc], url, dir);
  expect(request.isDone()).toBe(true);
});
