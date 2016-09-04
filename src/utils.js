import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import cheerio from 'cheerio'
import request from 'request'

export function getPackageJSON(basedir) {
  if (!basedir) {
    basedir = __dirname
  }

  const pkgPath = `${basedir}/package.json`
  try {
    const pkgStat = fs.statSync(pkgPath)
    if (pkgStat.isFile()) {
      return pkgPath
    }

    return null
  } catch (e) {
    const base = path.dirname(basedir)
    return getPackageJSON(base)
  }
}

export function getDependencies(pkgJSON) {
  return new Promise((resolve, reject) => {
    fs.readFile(pkgJSON, (err, data) => {
      if (err) {
        reject(err)
      } else {
        const meta = JSON.parse(data.toString())
        const deps = []
        for (const [name, version] of Object.entries(meta.devDependencies)) {
          deps.push(name)
        }

        for (const [name, version] of Object.entries(meta.dependencies)) {
          deps.push(name)
        }

        resolve(deps)
      }
    })
  })
}

export function getGithubUrl(name) {
  return new Promise((resolve, reject) => {
    const p = spawn('npm', ['view', '--json', name])

    let error = ''
    let out = ''
    p.stdout.on('data', (data) => {
      out += data.toString()
    })

    p.stderr.on('data', (data) => {
      error += data.toString()
    })

    p.on('exit', () => {
      if (error) {
        reject(error)
      } else {
        const meta = JSON.parse(out)
        const url = meta.repository && meta.repository.url
        if (url) {
          const formatUrl = url.replace(/^git@/, 'https://')
          const str = formatUrl.replace(/^git\+https/, 'https')
          const newStr = str.replace(/^git:/, 'https:')
          resolve(newStr)
        } else {
          resolve(meta.homepage)
        }
      }
    })
  })
}

export function getStars(url) {
  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        reject(error)
      } else {
        const $ = cheerio.load(body)
        const starNode = $('div').find('a.social-count')
        const stars = starNode[1].attribs['aria-label'].split(' ')[0]

        resolve(stars)
      }
    })
  })
}
