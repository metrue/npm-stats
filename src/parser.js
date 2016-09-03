import cheerio from 'cheerio'
import request from 'request'


async function fetchPage(url) {
}

function getStars(htmlMarkup) {
  const $ = cheerio.load(htmlMarkup)
  const starNode = $('div').find('a.social-count')
  const stars = starNode[1].attribs['aria-label'].split(' ')[0]
  return stars
}
//  .js-toggler-container .js-social-container .starring-container

try {
  fetchPage('https://github.com/cheeriojs/cheerio')
    .then((html) => {
      try {
        const stars = getStars(html)
        console.log(stars)
      } catch (e) {
        console.log(e)
      }
    })
    .catch((e) => {
      console.log(e);
    })
} catch (e) {
  console.log(e)
}

