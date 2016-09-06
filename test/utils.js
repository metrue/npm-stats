import { expect } from 'chai'
import { locateRoot, readDeps, getGithubUrl, readNpmMeta, getGithubMatrix } from '../lib/utils'

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
    expect(pkgJSON).to.equal('/Users/mhuang/Codes/npm-stars/package.json')
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
    const pkgJSONFile = '/Users/mhuang/Codes/npm-stars/package.json'
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

  it('should get github url', async () => {
    // eslint-disable-next-line
    const meta = require('./cheerio_meta.json')
    const url = await getGithubUrl(JSON.stringify(meta))
    expect(url).to.equal('https://github.com/cheeriojs/cheerio.git')
  })

  it('should get matrix of rep', async () => {
    const metrix = await getGithubMatrix('https://github.com/benmosher/eslint-plugin-import')
    expect(metrix).to.eql({
      watchings: 19,
      stars: 404,
      forks: 85,
    })
  })
})
