# Wrenn landing page

Next.js landing page for Wrenn, deployed on Vercel. 

Imports shared design tokens from `../brand/tokens.css`. On Vercel (root directory `web/`), keep "Include files outside the root directory in the Build Step" turned on, or the build cannot find that file.

## Commands

- `npm run dev`: start the site at http://localhost:3000
- `npm run test:e2e`: run the Playwright tests
