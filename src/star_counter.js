import blessed from 'blessed'
import contrib from 'blessed-contrib'

import {
  getPackageJSON,
  getDependencies,
  getGithubUrl,
  getStars,
} from '../lib/utils'

class StarCounter {
  constructor() {
    this.deps = []
    this.counts = {}
  }

  async run() {
    await this.prepare()
    await this.count()
    await this.draw()
  }

  async prepare() {
    const pkgJSON = getPackageJSON()
    try {
      this.deps = await getDependencies(pkgJSON)
    } catch (e) {
      console.warn(e)
    }
  }

  async count() {
    const tasks = []
    const self = this
    for (const dep of this.deps) {
      const t = getGithubUrl(dep)
        .then(url => getStars(url))
        .then(stars => {
          self.counts[dep] = stars
        })
        .catch(e => {
          console.warn(e)
        })
      tasks.push(t)
    }
    return Promise.all(tasks)
  }

  async draw() {
    await this.count()

    const screen = blessed.screen()

    const bar = contrib.bar({
      label: 'Stars of Dependencies',
      barWidth: 2,
      barSpacing: 1,
      xOffset: 0,
      maxHeight: 9,
    })

    screen.append(bar) // must append before setting data
    const titles = []
    const data = []
    for (const [k, v] of Object.entries(this.counts)) {
      titles.push(k)
      data.push(parseInt(v, 10))
    }
    bar.setData({
      titles,
      data,
    })

    screen.key(['escape', 'q', 'C-c'], () => {
      return process.exit(0)
    })

    screen.render()
  }
}

const starCounter = new StarCounter()
starCounter.run()
