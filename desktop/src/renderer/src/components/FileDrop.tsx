import { useRef, useState, type DragEvent } from 'react'

type Props = {
  label: string
  hint?: string
  // Same format as a file input, e.g. "image/*" or "video/*"
  accept: string
  multiple?: boolean
  files: File[]
  onFiles: (files: File[]) => void
  // Taller box for the main upload on a screen
  big?: boolean
  // What to suggest when a file type is wrong, e.g. "an MP3 or WAV song"
  typeHint?: string
}

// Does this file match an accept string like "image/*,video/*"?
function matches(file: File, accept: string): boolean {
  return accept.split(',').some((rule) => {
    const r = rule.trim()
    if (r.endsWith('/*')) return file.type.startsWith(r.slice(0, -1))
    return file.type === r || file.name.toLowerCase().endsWith(r)
  })
}

// Drop files on the box, or click Browse. The screen only keeps the picked files:
// the main process copies them into the job folder when the video starts.
export function FileDrop({ label, hint, accept, multiple = false, files, onFiles, big = false, typeHint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  // Shown when a dropped file can't be used, so nothing fails silently
  const [rejected, setRejected] = useState(false)

  function take(list: FileList | null) {
    if (!list || list.length === 0) return
    const picked = Array.from(list).filter((f) => matches(f, accept))
    setRejected(picked.length < list.length)
    if (picked.length === 0) return
    onFiles(multiple ? [...files, ...picked] : picked.slice(0, 1))
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    take(e.dataTransfer.files)
  }

  return (
    <div>
      <div className="mb-sm">
        <div className="text-[0.9375rem] font-semibold text-navy">{label}</div>
        {hint && <div className="text-[0.8125rem] font-medium text-navy-body">{hint}</div>}
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        // Only stop the highlight when the pointer really leaves the box, not when it moves over the text inside
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false)
        }}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-sm rounded-md border-2 border-dashed px-md text-center transition-colors duration-150 ${big ? 'py-2xl' : 'py-lg'} ${dragging ? 'border-teal bg-sky-soft' : 'border-navy/30 bg-card'}`}
      >
        <p className="text-base text-navy-body">
          {multiple ? 'Drop files here, or' : 'Drop a file here, or'}
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={`Browse for ${label.toLowerCase()}`}
          className="press cursor-pointer rounded-pill border-2 border-navy px-[18px] py-[6px] font-display text-lg leading-none text-navy"
        >
          Browse
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          tabIndex={-1}
          className="sr-only"
          aria-hidden
          onChange={(e) => {
            take(e.target.files)
            e.target.value = ''
          }}
        />
      </div>
      {rejected && (
        <p className="mt-sm text-[0.8125rem] font-semibold text-red dark:text-[#FF8A80]" role="alert">
          Wrenn can't use that file type yet. Try {typeHint ?? (accept.startsWith('video') ? 'an MP4 or MOV video' : 'a PNG or JPG image')}.
        </p>
      )}
      {files.length > 0 && (
        <div className="mt-sm flex items-start justify-between gap-md">
          <ul className="min-w-0 text-[0.8125rem] font-medium text-navy" aria-label={`${label}: chosen files`}>
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="truncate">
                {f.name}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => onFiles([])}
            className="inline-flex min-h-6 shrink-0 cursor-pointer items-center rounded-sm text-[0.8125rem] font-semibold text-navy underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            {files.length > 1 ? 'Remove all' : 'Remove'}
          </button>
        </div>
      )}
    </div>
  )
}
