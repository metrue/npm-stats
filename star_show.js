import fetch from 'isomorphic-fetch';
import fs from 'fs';
import Repo from './src/repo'

const NODE_MODULES_DIR = './node_modules';

async function getRepos() {
  const repos = [];
  return new Promise((resolve, reject) => {
    fs.readdir(NODE_MODULES_DIR, (err, dirs) => {
      if (err) {
        reject(err);
      } else {
        dirs.forEach((dirname) => {
          const packageJSONFile = `${NODE_MODULES_DIR}/${dirname}/package.json`;
          try {
            const content = fs.readFileSync(packageJSONFile);
            const meta = JSON.parse(content.toString());
            const url = meta.repository && meta.repository.url;
            if (url) {
              const cuts = url.split(/\//);
              const len = cuts.length;
              const repo = cuts[len - 1].replace(/\.git/, '');
              const username = cuts[len - 2];
              repos.push({
                repo,
                username,
              });
            }
          } catch (e) {
            console.log(err);
          }
        });
        resolve(repos);
      }
    });
  });
}

async function main() {
  const results = [];
  const repos = await getRepos();
  for (const r of repos) {
    try {
      const repo = new Repo(r.username, r.repo)
      const stars = await repo.getStars()
      console.log(r.username, r.repo, stars);
      results.push({
        repo: r.repo,
        author: r.username,
        stars,
      });
    } catch (e) {
      console.log(r.username, r.repo, 'Error');
      // console.warn(e);
    }
  }

  results.forEach((r) => {
    process.stdout.write(`${r.stars} `);
  });
}


try {
  main();
} catch (e) {
  console.warn(e);
}
