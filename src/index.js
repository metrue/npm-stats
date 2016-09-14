import Cell from 'cell.js'

import {
  locateRoot,
  readDeps,
  readNpmMeta,
  getGithubUrl,
  getGithubMatrix,
  getDepoName,
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
        await this.count()
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

    if (this.deps.length > 0) {
      const headers = ['repo', 'stars', 'forks', 'watchings', 'issues']
      for (const h of headers) {
        const config = this._cellConfig(h, h)
        const cell = new Cell(config)
        cell.write()
      }
      console.log('\n')
    }

    const depsMap = {}
    function updateMap(info, dep) {
      let depName
      try {
        depName = getDepoName(info.url)
      } catch (e) {
        depName = dep
      }

      info.repo = depName
      return info
    }

    for (const dep of this.deps) {
      const t = readNpmMeta(dep)
        .then(getGithubUrl)
        .then(getGithubMatrix)
        .then(info => {
          const newInfo = updateMap(info)
          if (!depsMap[newInfo.repo]) {
            self.output(newInfo)
            depsMap[newInfo.repo] = true
          }
        })
        .catch(() => {
          self.skips.push(dep)
        })
      tasks.push(t)
    }
    return Promise.all(tasks)
  }

  output(info) {
    const keys = ['repo', 'stars', 'forks', 'watchings', 'issues']
    for (const k of keys) {
      const config = this._cellConfig(k, info[k])
      const cell = new Cell(config)
      cell.write()
    }
    console.log('')
  }

  _cellConfig(name, value) {
    let align = 'left'
    let length = 10
    if (name === 'repo') {
      align = 'right'
      length = 25
    }
    return {
      length,
      content: String(value),
      foregroundColor: 245,
      backgroundColor: 'black',
      align,
    }
  }
}
