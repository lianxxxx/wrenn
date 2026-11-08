import { defineConfig } from '@playwright/test'

// Playwright tests for the built app. Run with: npm test
// (the test script builds the app first, then runs these). See tests/README.md.
export default defineConfig({
  testDir: './tests',
  // One app at a time: each test opens a real Wrenn window, and fewer windows is more reliable
  workers: 1,
  fullyParallel: false,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  // A failed test runs once more, so a slow moment on the computer doesn't fail the release check
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]]
})
