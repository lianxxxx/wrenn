// A Windows notification when a video finishes (or fails), so the user can do
// something else while they wait. Only shows when the Wrenn window isn't in front.
//
// Windows only shows notifications for an app with an AppUserModelId. index.ts sets it
// to "com.wrenn.app", the same as appId in electron-builder.yml (in dev it's the Electron exe).

import { BrowserWindow, Notification, type WebContents } from 'electron'
import { join } from 'path'

// Keep each notification until it's clicked or closed. Without this, JavaScript may
// throw it away early and the click would do nothing.
const showing = new Set<Notification>()

export function notifyJobEnd(sender: WebContents, ok: boolean, brandName: string): void {
  if (!Notification.isSupported() || sender.isDestroyed()) return
  const window = BrowserWindow.fromWebContents(sender)
  // The user is looking at Wrenn already: the screen tells them
  if (!window || (window.isFocused() && !window.isMinimized())) return

  const notification = new Notification({
    title: ok ? 'Your video is ready' : "Your video didn't finish",
    body: ok
      ? `Your ${brandName} video is saved in Videos\\Wrenn.`
      : 'Open Wrenn to see what happened and try again.',
    icon: join(__dirname, '../../resources/icon.png')
  })

  // Clicking it brings Wrenn back to the front
  notification.on('click', () => {
    showing.delete(notification)
    if (window.isDestroyed()) return
    if (window.isMinimized()) window.restore()
    window.show()
    window.focus()
  })
  notification.on('close', () => showing.delete(notification))

  showing.add(notification)
  notification.show()
}
