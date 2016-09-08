import { expect } from 'chai'
import path from 'path'

import {
  locateRoot,
  readDeps,
  getGithubUrl,
  readNpmMeta,
  getGithubMatrix,
  formatGitHubUrl,
} from '../lib/utils'

function getDeps(pkg) {
  const deps = []
  if (pkg.dependencies) {
    for (const [k] of Object.entries(pkg.dependencies)) {
      deps.push(k)
    }
  }

  if (pkg.devDependencies) {
    for (const [k] of Object.entries(pkg.devDependencies)) {
      deps.push(k)
    }
  }

  return deps
}

function arrayEql(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false
  }

  for (const i of arr1) {
    if (arr2.indexOf(i) === -1) {
      return false
    }
  }

  for (const i of arr2) {
    if (arr1.indexOf(i) === -1) {
      return false
    }
  }

  return true
}

describe('utils', () => {
  it('should get package.json', () => {
    const pkgJSON = locateRoot()
    expect(pkgJSON).to.equal(path.resolve(__dirname, '../package.json'))
  })

  it('should throw error', () => {
    let error = null
    try {
      locateRoot('/')
    } catch (e) {
      error = e
    }
    expect(error).to.eql(new Error('not a Node project'))
  })

  it('should get dependencies', async () => {
    const pkgJSONFile = `${__dirname}/../package.json`
    // eslint-disable-next-line
    const pkg = require(pkgJSONFile)
    const deps = getDeps(pkg)
    const actualDeps = await readDeps(pkgJSONFile)
    expect(arrayEql(deps, actualDeps)).to.equal(true)
  })

  it('should get npm meta info', async () => {
    const name = 'babel-regenerator-runtime'
    const metaString = await readNpmMeta(name)
    let error = null
    let meta = null
    try {
      meta = JSON.parse(metaString)
    } catch (e) {
      error = e
    }
    expect(error).to.equal(null)
    expect(meta.name).equal(name)
  })

  describe('formatGitHubUrl', () => {
    it('domain:username', () => {
      const url = 'https://github.com:Carrooi/Node-RecursiveMerge.git'
      const formated = formatGitHubUrl(url)
      expect(formated).to.equal('https://github.com/Carrooi/Node-RecursiveMerge.git')
    })

    it('git@github', () => {
      const url = 'git@github.com:metrue/npm-stars.git'
      const formated = formatGitHubUrl(url)
      expect(formated).to.equal('https://github.com/metrue/npm-stars.git')
    })

    it('https', () => {
      const url = 'https://github.com/babel/babel/tree/master/packages/babel-preset-stage-0'
      const formated = formatGitHubUrl(url)
      expect(formated).to.equal('https://github.com/babel/babel/tree/master/packages/babel-preset-stage-0')
    })
  })

  it('should get github url', async () => {
    // eslint-disable-next-line
    const meta = require('./cheerio_meta.json')
    const url = await getGithubUrl(JSON.stringify(meta))
    expect(url).to.equal('https://github.com/cheeriojs/cheerio.git')
  })

  it('should get matrix of rep', async () => {
    const metrix = await getGithubMatrix('https://github.com/benmosher/eslint-plugin-import')
    expect(metrix.watchings).to.be.at.least(0)
    expect(metrix.stars).to.be.at.least(0)
    expect(metrix.forks).to.be.at.least(0)
    expect(metrix.issues).to.be.at.least(0)
  })
})
