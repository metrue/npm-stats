import Table from 'cli-table'

import {
  locateRoot,
  readDeps,
  readNpmMeta,
  getGithubUrl,
  getGithubMatrix,
} from '../lib/utils'

class StarCounter {
  constructor() {
    this.deps = []
    this.counts = {}

    this.skips = []
  }

  async run() {
    try {
      await this.prepare()
      await this.count()
      await this.report()
    } catch (e) {
      console.log(e)
    }
  }

  async prepare() {
    const pkg = locateRoot()
    try {
      this.deps = await readDeps(pkg)
    } catch (e) {
      throw new Error(`cannot get dependencies from ${pkg}`)
    }
  }

  async count() {
    const tasks = []
    const self = this
    for (const dep of this.deps) {
      const t = readNpmMeta(dep)
        .then(getGithubUrl)
        .then(getGithubMatrix)
        .then(info => {
          self.counts[dep] = info
        })
        .catch(() => {
          self.skips.push(dep)
        })
      tasks.push(t)
    }
    return Promise.all(tasks)
  }

  report() {
    const table = new Table({
      chars: {
        mid: '',
        'left-mid': '',
        'mid-mid': '',
        'right-mid': '',
      },
    })

    table.push(['repo', 'stars', 'forks', 'watchings'], ['', '', '', ''])
    for (const [k, v] of Object.entries(this.counts)) {
      table.push([k, v.stars, v.forks, v.watchings])
    }
    console.log(table.toString())
  }
}

const starCounter = new StarCounter()
starCounter.run()
