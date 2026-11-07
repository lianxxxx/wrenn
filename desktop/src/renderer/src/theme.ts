// Runs before the app draws, so a saved dark choice doesn't flash light first.
// Light is the default. The choice is saved in localStorage under "theme".
try {
  if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark')
} catch {
  // Storage can be blocked; light is fine then
}
