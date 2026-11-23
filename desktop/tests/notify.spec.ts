// When Wrenn shows the "video finished" notification, and what it says.
// Plain functions, no app window and no real notification.

import { expect, test } from '@playwright/test'
import { jobEndMessage, shouldNotify } from '../src/main/notifyRules'

test('notifies only when Wrenn is not in front', () => {
  // Looking at Wrenn: the screen already says it's done
  expect(shouldNotify({ focused: true, minimized: false })).toBe(false)
  // In another app, or Wrenn is minimized
  expect(shouldNotify({ focused: false, minimized: false })).toBe(true)
  expect(shouldNotify({ focused: false, minimized: true })).toBe(true)
  expect(shouldNotify({ focused: true, minimized: true })).toBe(true)
  // The window is gone: nothing to bring back
  expect(shouldNotify(null)).toBe(false)
})

test('the notification says if the video is ready, in plain words', () => {
  expect(jobEndMessage(true, 'Trackr')).toEqual({
    title: 'Your video is ready',
    body: 'Your Trackr video is saved in Videos\\Wrenn.'
  })
  expect(jobEndMessage(false, 'Trackr')).toEqual({
    title: "Your video didn't finish",
    body: 'Open Wrenn to see what happened and try again.'
  })
})
