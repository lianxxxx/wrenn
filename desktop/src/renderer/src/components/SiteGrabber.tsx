import { useState } from 'react'
import { Button } from './Button'
import { Spinner } from './Spinner'
import { TextField } from './TextField'
import { cleanError, type SiteBrand, type SiteGrab } from '../data'
import { MAX_SITE_URL } from '../../../shared/limits'

type Props = {
  url: string
  onUrl: (url: string) => void
  // Colors and fonts from the last grab, if any
  site?: SiteBrand
  // False when the template has no screenshots box, so the screenshots are left out
  withPhotos: boolean
  onGrabbed: (grab: SiteGrab) => void
  onClearSite: () => void
}

// "Grab from my site": paste a link, and Wrenn takes the screenshots, logo, colors and fonts.
// The files land in the boxes below like normal uploads, so the user can remove any.
export function SiteGrabber({ url, onUrl, site, withPhotos, onGrabbed, onClearSite }: Props) {
  const [grabbing, setGrabbing] = useState(false)
  const [error, setError] = useState('')
  const [added, setAdded] = useState('')

  async function grab() {
    if (grabbing || url.trim() === '') return
    setGrabbing(true)
    setError('')
    setAdded('')
    try {
      const result = await window.api.grabSite(url.trim())
      onGrabbed(result)
      setAdded(summary(result, withPhotos))
    } catch (e) {
      setError(cleanError(e))
    } finally {
      setGrabbing(false)
    }
  }

  return (
    <div>
      <TextField
        label="Your website (optional)"
        hint="Paste a link and Wrenn takes screenshots and picks up your logo, colors and fonts. Pages behind a login won't work."
        placeholder="e.g. https://yoursite.com"
        type="url"
        inputMode="url"
        maxLength={MAX_SITE_URL}
        value={url}
        disabled={grabbing}
        onChange={(e) => onUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            void grab()
          }
        }}
      />
      <Button variant="ghost" className="mt-sm" onClick={grab} disabled={grabbing || url.trim() === ''}>
        {grabbing ? 'Grabbing...' : 'Grab from my site'}
      </Button>

      <div aria-live="polite">
        {grabbing && (
          <p className="mt-sm flex items-center gap-sm text-[0.9375rem] text-navy-body">
            <Spinner className="size-5" />
            Looking at your site. This takes about 20 seconds.
          </p>
        )}
        {added && !grabbing && <p className="mt-sm text-[0.9375rem] text-navy-body">{added}</p>}
      </div>
      {error && !grabbing && (
        <p className="mt-sm text-[0.8125rem] font-semibold text-red dark:text-[#FF8A80]" role="alert">
          {error}
        </p>
      )}

      {site && !grabbing && (
        <div className="mt-md rounded-sm border-2 border-line bg-card px-md py-sm">
          <p className="text-[0.8125rem] font-semibold text-navy">From your site</p>
          {site.colors.length > 0 && (
            <ul className="mt-xs flex flex-wrap gap-xs" aria-label="Colors from your site">
              {site.colors.map((c) => (
                <li
                  key={c}
                  title={c}
                  aria-label={c}
                  className="size-6 rounded-pill border-2 border-line"
                  style={{ backgroundColor: c }}
                />
              ))}
            </ul>
          )}
          {site.fonts.length > 0 && (
            <p className="mt-xs text-[0.8125rem] font-medium text-navy-body">Fonts: {site.fonts.join(', ')}</p>
          )}
          <button
            type="button"
            onClick={onClearSite}
            className="mt-xs inline-flex min-h-6 cursor-pointer items-center rounded-sm text-[0.8125rem] font-semibold text-navy underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            Don't use these colors and fonts
          </button>
        </div>
      )}
    </div>
  )
}

// "Added 8 screenshots and your logo. Remove any you don't want below."
function summary(grab: SiteGrab, withPhotos: boolean): string {
  const parts: string[] = []
  if (withPhotos && grab.photos.length > 0) parts.push(`${grab.photos.length} screenshot${grab.photos.length === 1 ? '' : 's'}`)
  if (grab.logo) parts.push('your logo')
  if (grab.fonts.length > 0) parts.push(`${grab.fonts.length} font file${grab.fonts.length === 1 ? '' : 's'}`)
  const found = grab.colors.length > 0 || grab.fontFamilies.length > 0
  if (parts.length === 0) {
    return found
      ? 'Got your colors and fonts. Wrenn will use them in the video.'
      : "Wrenn opened the page but couldn't find anything to use. Try uploading your files instead."
  }
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
  return `Added ${list}. Remove any you don't want below.`
}
