import cheerio from 'cheerio';

const getImgSrcs = (html) => {
  const $ = cheerio.load(html);
  const imgSrcs = $('img').map((i, imgEl) => $(imgEl).attr('src')).toArray()
    .filter((src) => !src.startsWith('data:'));
  return [...new Set(imgSrcs)]; // Uniq
};

const updateHtml = (html, imgPaths) => {
  const $ = cheerio.load(html);
  $('img').each((i, imgEl) => {
    const $imgEl = $(imgEl);
    const imgSrc = $imgEl.attr('src');
    imgPaths.forEach((imgPath) => {
      if (imgPath[imgSrc] !== undefined) {
        $imgEl.attr('src', imgPath[imgSrc]);
      }
    });
  });
  return $.html();
};

export { getImgSrcs, updateHtml };
