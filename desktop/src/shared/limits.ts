// Limits and lists both sides use: the screens (to stop typing or pick files) and
// the main process (to check what it gets).
// Plain values only, so the renderer and main can both import this file.

// "What does it do?" box: one or two sentences
export const MAX_ABOUT = 300

// Sound files Wrenn can mix in: the user's own song, and the songs and effects that ship with Wrenn
export const AUDIO_EXTS = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac']

// "Extra instructions" under Advanced: a short note, not a whole prompt
export const MAX_EXTRA = 1000

// "My own prompt" templates
export const MAX_TEMPLATE_NAME = 60
export const MAX_CUSTOM_PROMPT = 4000
// "Where it's from": a creator's name or a link
export const MAX_CREDIT = 200
// How many saved templates Wrenn keeps
export const MAX_CUSTOM_TEMPLATES = 50
