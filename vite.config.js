import { defineConfig } from 'vite';

// GitHub Pages project sites live at https://user.github.io/<repo>/ — assets need that prefix.
// User/org site repos named <user>.github.io deploy at domain root; use base "/".
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isUserGithubIoSite = repo?.endsWith('.github.io');
const base =
  repo && !isUserGithubIoSite ? `/${repo}/` : '/';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  base,
});
