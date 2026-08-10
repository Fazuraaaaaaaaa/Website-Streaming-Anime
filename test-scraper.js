const cheerio = require('cheerio');
async function test() {
  try {
    const targetUrl = 'https://otakudesu.cloud/';
    const res = await fetch('https://animehub-lyart-rho.vercel.app/api/proxy?url=' + encodeURIComponent(targetUrl));
    const html = await res.text();
    console.log("HTML length:", html.length);
    const $ = cheerio.load(html);
    const results = [];
    $('.venz ul li').each((i, el) => {
      if (i > 2) return;
      results.push({
        title: $(el).find('h2.jdlflm').text().trim(),
        episode: $(el).find('.epz').text().trim(),
        image: $(el).find('img').attr('src'),
        url: $(el).find('a').attr('href')
      });
    });
    console.log('ONGOING:', results);
  } catch (e) {
    console.error(e);
  }
}
test();
