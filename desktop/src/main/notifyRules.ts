// When to show the "video finished" notification, and what it says.
// Plain functions only (no Electron), so the tests can check them without a real notification.

export type WindowState = { focused: boolean; minimized: boolean }

// Only when the Wrenn window isn't in front. No window means nothing to bring back.
export function shouldNotify(window: WindowState | null): boolean {
  if (!window) return false
  // The user is looking at Wrenn already: the screen tells them
  return !window.focused || window.minimized
}

export function jobEndMessage(ok: boolean, brandName: string): { title: string; body: string } {
  return ok
    ? { title: 'Your video is ready', body: `Your ${brandName} video is saved in Videos\\Wrenn.` }
    : { title: "Your video didn't finish", body: 'Open Wrenn to see what happened and try again.' }
}
