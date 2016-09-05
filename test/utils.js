import { expect } from 'chai'
import { getPackageJSON, getDependencies, getGithubUrl, getStars } from '../lib/utils'

function getDeps(pkg) {
  const deps = []
  if (pkg.dependencies) {
    for (const [k, v] of Object.entries(pkg.dependencies)) {
      deps.push(k)
    }
  }

  if (pkg.devDependencies) {
    for (const [k, v] of Object.entries(pkg.devDependencies)) {
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
    const pkgJSON = getPackageJSON()
    expect(pkgJSON).to.equal('/Users/mhuang/Codes/npm-stars/package.json')
  })

  it('should get dependencies', async () => {
    const pkgJSONFile = '/Users/mhuang/Codes/npm-stars/package.json'
    const pkg = require(pkgJSONFile)
    const deps = getDeps(pkg)
    const actualDeps = await getDependencies(pkgJSONFile)
    expect(arrayEql(deps, actualDeps)).to.equal(true)
  })

  it('should get github url', async () => {
    const name = 'chai'
    const url = await getGithubUrl(name)
    expect(url).to.equal('https://github.com/chaijs/chai.git')
  })

  it('should get stars of rep', async () => {
    const stars = await getStars('https://github.com/metrue/npm-stars')
    expect(stars).to.equal(0)
  })
})
