const getFilePath = (page, dirname) => {
  const pageURL = new URL(page);
  const filename = `${pageURL.hostname}${pageURL.pathname}`
    .replace(/[^a-zA-Z0-9]/g, '-');
  return `${dirname}/${filename}.html`;
};

export default getFilePath;
