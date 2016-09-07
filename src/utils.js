import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import cheerio from 'cheerio'
import request from 'request'

export function locateRoot(basedir) {
  try {
    if (!basedir) {
      basedir = process.cwd()
    }
    const pkgPath = `${basedir}/package.json`
    fs.statSync(pkgPath)
    return pkgPath
  } catch (e) {
    if (basedir === '/') {
      throw new Error('not a Node project')
    }

    const base = path.dirname(basedir)
    return locateRoot(base)
  }
}

export function readDeps(pkgJSON) {
  return new Promise((resolve, reject) => {
    fs.readFile(pkgJSON, (err, data) => {
      if (err) {
        reject(err)
      } else {
        const deps = []
        const meta = JSON.parse(data.toString())
        const rawDeps = Object.assign({}, meta.devDependencies, meta.dependencies)
        for (const [name] of Object.entries(rawDeps)) {
          deps.push(name)
        }
        resolve(deps)
      }
    })
  })
}

export function readNpmMeta(name) {
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
        resolve(out)
      }
    })
  })
}

export function formatGitHubUrl(githubUrl) {
  if (githubUrl.match('github.com')) {
    const cuts = githubUrl.split(':')
    if (cuts[0] === 'git@github.com') {
      cuts[0] = 'https://github.com'
    } else if (cuts[0] === 'git+https') {
      cuts[0] = 'https:/'
    } else if (cuts[0] === 'git') {
      cuts[0] = 'https:/'
    } else {
      cuts[0] += ':/'
    }

    return cuts.join('/').replace('////', '//')
  }

  throw new Error('not a github url')
}

export function getGithubUrl(npmMeta) {
  const meta = JSON.parse(npmMeta)
  const url = (meta.repository && meta.repository.url) || meta.homepage
  if (url) {
    return formatGitHubUrl(url)
  }

  throw new Error(`cannot found url or homepage of ${meta.name}`)
}

export function getGithubMatrix(url) {
  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        reject(error)
      } else {
        try {
          const $ = cheerio.load(body)
          const starNode = $('div').find('a.social-count')
          const watchings = starNode[0].attribs['aria-label'].split(' ')[0]
          const stars = starNode[1].attribs['aria-label'].split(' ')[0]
          const forks = starNode[2].attribs['aria-label'].split(' ')[0]

          const issues = $('nav').find('span.counter')
          const openingIssues = (issues
            && issues[0]
            && issues[0].children
            && issues[0].children[0]
            && issues[0].children[0].data) || 0

          resolve({
            watchings: parseInt(watchings, 10),
            stars: parseInt(stars, 10),
            forks: parseInt(forks, 10),
            openingIssues: parseInt(openingIssues, 10),
          })
        } catch (e) {
          reject(e)
        }
      }
    })
  })
}
