import { useState } from 'react'

type Props = {
  onDismiss: () => void
}

// A small pill under the header when a newer Wrenn has been downloaded.
// "Restart" installs it now. "Not now" hides it: the update then installs
// on its own the next time Wrenn is closed.
export function UpdateBanner({ onDismiss }: Props) {
  const [restarting, setRestarting] = useState(false)

  async function restart() {
    setRestarting(true)
    try {
      await window.api.installUpdate()
    } catch {
      // Couldn't restart: let them try again. The update still installs when Wrenn closes.
      setRestarting(false)
    }
  }

  return (
    <div role="status" className="screen-in flex justify-center px-xl">
      <div className="flex flex-wrap items-center gap-md rounded-pill bg-sky-soft py-xs pl-lg pr-xs text-base text-navy">
        <p>A new version of Wrenn is ready. Restart to update.</p>
        <div className="flex items-center gap-xs">
          <button
            type="button"
            onClick={onDismiss}
            className="press cursor-pointer rounded-pill px-md py-xs font-semibold text-navy-body hover:text-navy"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={restart}
            disabled={restarting}
            className="press cursor-pointer rounded-pill border-2 border-navy bg-navy px-md py-xs font-display text-lg leading-none text-cream disabled:cursor-not-allowed disabled:opacity-40"
          >
            {restarting ? 'Restarting' : 'Restart'}
          </button>
        </div>
      </div>
    </div>
  )
}
