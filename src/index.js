import Table from 'cli-table'
import ProgressBar from './progress_bar'

import {
  locateRoot,
  readDeps,
  readNpmMeta,
  getGithubUrl,
  getGithubMatrix,
} from './utils'

export default class {
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
      this.pace = new ProgressBar(this.deps.length + 1)
    } catch (e) {
      throw new Error(`cannot get dependencies from ${pkg}`)
    }
  }

  async count() {
    const tasks = []
    const self = this

    this.pace.step()

    for (const dep of this.deps) {
      const t = readNpmMeta(dep)
        .then(getGithubUrl)
        .then(getGithubMatrix)
        .then(info => {
          self.counts[dep] = info
          self.pace.step()
        })
        .catch(() => {
          self.skips.push(dep)
          self.pace.step()
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

    table.push(['repo', 'stars', 'forks', 'watchings', 'opening issues'], ['', '', '', '', ''])
    for (const [k, v] of Object.entries(this.counts)) {
      table.push([k, v.stars, v.forks, v.watchings, v.openingIssues])
    }
    console.log(table.toString())
  }
}
