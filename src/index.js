import Table from 'cli-table'
import Dooing from 'dooing'

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
      if (this.deps.length) {
        this.dobar = new Dooing({ mark: '*', total: this.deps.length })

        await this.count()
        console.log('\n')
        await this.report()
      } else {
        console.log('no any dependencies in your project')
      }
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

    this.dobar.step()

    for (const dep of this.deps) {
      const t = readNpmMeta(dep)
        .then(getGithubUrl)
        .then(getGithubMatrix)
        .then(info => {
          self.counts[dep] = info
          self.dobar.step()
        })
        .catch(() => {
          self.skips.push(dep)
          self.dobar.step()
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
    const list = Object.entries(this.counts)
    const sorted = list.sort((a, b) => {
      return b[1].stars - a[1].stars
    })
    for (const d of sorted) {
      table.push([d[0], d[1].stars, d[1].forks, d[1].watchings, d[1].openingIssues])
    }
    console.log(table.toString())
  }
}
