import cheerio from 'cheerio';
import _ from 'lodash';

const hrefAttrs = {
  script: 'src',
  link: 'href',
  img: 'src',
};

const getPaths = ($, tag) => $(tag).map((i, el) => $(el).attr(hrefAttrs[tag])).toArray();

const getResources = (html, tag) => {
  const $ = cheerio.load(html);
  return _.filter([...getPaths($, tag)], (path) => !path.startsWith('data:'));
};

const updateHtml = (html, assetMapPaths) => {
  const $ = cheerio.load(html);
  ['script', 'link', 'img'].map((tag) => $(tag)
    .each((i, el) => {
      const $el = $(el);
      const path = $el.attr(hrefAttrs[tag]);
      if (assetMapPaths[path] !== undefined) {
        $el.attr(hrefAttrs[tag], assetMapPaths[path]);
      }
    }));
  return $.html();
};

export { getResources, updateHtml };
