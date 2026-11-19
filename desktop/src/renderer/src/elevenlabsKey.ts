// ElevenLabs keys start with "sk_". Their page also shows a key ID that looks
// alike, and pasting that one makes every song fail. We warn but still save,
// in case ElevenLabs changes how keys look one day.
export function keyWarning(key: string): string | undefined {
  const clean = key.trim()
  if (!clean || clean.startsWith('sk_')) return undefined
  return "This doesn't look like an ElevenLabs key. Keys start with sk_. The key ID won't work."
}
