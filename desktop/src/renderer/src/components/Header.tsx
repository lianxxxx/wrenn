import logo from '../assets/wrenn-logo.png'

// Top bar with just the logo. Only shows when the sidebar is hidden (first setup,
// or while a video is being made), so the logo is never on screen twice.
export function Header() {
  return (
    <header className="flex items-center px-lg py-md">
      <img
        src={logo}
        alt="Wrenn"
        className="h-10 w-auto dark:[filter:drop-shadow(0_0_1px_#f3ebdd)_drop-shadow(0_0_1px_#f3ebdd)]"
      />
    </header>
  )
}
