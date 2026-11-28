import type { ReactNode } from 'react'
import logo from '../assets/wrenn-logo.png'

export type NavId = 'home' | 'templates' | 'videos' | 'settings'

type Props = {
  active: NavId
  onGo: (id: NavId) => void
  // True for a moment while a video is starting, so a click can't race it
  disabled?: boolean
}

// Simple line icons, drawn inline (no icon package)
const icons: Record<NavId, ReactNode> = {
  home: <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />,
  templates: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" />
      <rect x="13" y="13" width="7" height="7" rx="2" />
    </>
  ),
  videos: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M10 9.5v5l4.5-2.5z" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </>
  )
}

const items: { id: NavId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'templates', label: 'Templates' },
  { id: 'videos', label: 'Your videos' },
  { id: 'settings', label: 'Settings' }
]

// The left side of the app: logo on top, then the four places you can go.
// Wide windows show icon and label side by side. Narrower windows (under 1100px)
// get a slim rail with the label under the icon, so the screens keep their room.
// The active item sits on a sky marker blob, like the blob words.
export function Sidebar({ active, onGo, disabled }: Props) {
  return (
    <aside className="sticky top-0 flex h-screen w-[96px] shrink-0 flex-col border-r-2 border-line px-sm py-md min-[1100px]:w-[232px] min-[1100px]:px-md">
      <div className="flex justify-center px-xs pb-lg min-[1100px]:justify-start min-[1100px]:px-sm">
        <img
          src={logo}
          alt="Wrenn"
          className="h-auto w-full max-w-[72px] min-[1100px]:h-10 min-[1100px]:w-auto min-[1100px]:max-w-none dark:[filter:drop-shadow(0_0_1px_#f3ebdd)_drop-shadow(0_0_1px_#f3ebdd)]"
        />
      </div>

      <nav aria-label="Main">
        <ul className="flex flex-col gap-xs">
          {items.map((item) => {
            const isActive = item.id === active
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onGo(item.id)}
                  disabled={disabled}
                  aria-current={isActive ? 'page' : undefined}
                  className={`press relative isolate flex w-full cursor-pointer flex-col items-center gap-xs rounded-md px-xs py-sm text-center text-[0.8125rem] font-semibold leading-tight disabled:cursor-not-allowed disabled:opacity-50 min-[1100px]:flex-row min-[1100px]:gap-md min-[1100px]:px-md min-[1100px]:py-[10px] min-[1100px]:text-left min-[1100px]:text-base ${
                    isActive ? 'text-ink' : 'text-navy-body hover:bg-navy/5 hover:text-navy'
                  }`}
                >
                  {/* Sky keeps its color at night, so the active text uses ink (navy that never swaps) */}
                  {isActive && (
                    <span
                      aria-hidden
                      className="nav-pop absolute inset-0 -z-10 bg-sky"
                      style={{ borderRadius: '45% 38% 42% 40% / 50% 46% 54% 50%', filter: 'url(#marker-1)', rotate: '-1deg' }}
                    />
                  )}
                  <svg
                    viewBox="0 0 24 24"
                    className="size-6 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    {icons[item.id]}
                  </svg>
                  <span>{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
