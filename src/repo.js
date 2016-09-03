import cheerio from 'cheerio'
import request from 'request'

class Repo {
  constructor(user, repo) {
    this.url = `https://github.com/${user}/${repo}`
  }

  async getStars() {
    const htmlMark = await this._fetchPage()

    const $ = cheerio.load(htmlMark)
    const starNode = $('div').find('a.social-count')
    const stars = starNode[1].attribs['aria-label'].split(' ')[0]

    return stars
  }

  _fetchPage() {
    return new Promise((resolve, reject) => {
      request(this.url, (error, response, body) => {
        if (error) {
          reject(error)
        } else {
          resolve(body)
        }
      })
    })
  }
}

export default Repo
