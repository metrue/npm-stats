import { expect } from 'chai'
import { getPackageJSON, getDependencies, getGithubUrl, getStars } from '../lib/utils'

describe('utils', () => {
  it.skip('should get package.json', () => {
    const pkgJSON = getPackageJSON()
    expect(pkgJSON).to.equal('/Users/mhuang/Codes/xstars/package.json')
  })

  it.skip('should get dependencies', async () => {
    const pkgJSONFile = '/Users/mhuang/Codes/xstars/package.json'
    const deps = await getDependencies(pkgJSONFile)
    expect(deps).to.equal([])
  })

  it('should get github url', async () => {
    const name = 'babel'
    const url = await getGithubUrl(name)
    expect(url).to.equal('https://github.com/babel/babel/tree/master/packages/babel')
  })

  it('should get stars of rep', async () => {
    const stars = await getStars('https://github.com/babel/babel/tree/master/packages/babel')
    expect(stars).to.equal('17399')
  })
})
