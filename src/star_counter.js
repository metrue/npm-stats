import blessed from 'blessed'
import contrib from 'blessed-contrib'

import { getPackageJSON, getDependencies, getGithubUrl, getStars } from '../lib/utils'

class StarCounter {
  constructor() {
    this.counts = {}
  }

  async run() {
    await this.draw()
  }

  async count() {
    try {
      const pkgJSON = await getPackageJSON()
      const deps = await getDependencies(pkgJSON)
      for (const dep of deps) {
        const url = await getGithubUrl(dep)
        const stars = await getStars(url)
        this.counts[dep] = stars
      }
    } catch (e) {
      console.log(e)
    }
  }

  async draw() {
    await this.count()

    const screen = blessed.screen()

    const bar = contrib.bar({
      label: 'Stars of Dependencies',
      barWidth: 4,
      barSpacing: 6,
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
