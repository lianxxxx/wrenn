// Small checks for "Make a video from a link", kept apart from siteGrab.ts so the tests
// can run them without an app window. No Electron in here.

import { BlockList, isIP } from 'net'

// Addresses on this computer, the home or office network, or not meant for websites at all
const PRIVATE_V4 = new BlockList()
PRIVATE_V4.addSubnet('0.0.0.0', 8, 'ipv4')
PRIVATE_V4.addSubnet('10.0.0.0', 8, 'ipv4')
PRIVATE_V4.addSubnet('100.64.0.0', 10, 'ipv4')
PRIVATE_V4.addSubnet('127.0.0.0', 8, 'ipv4')
PRIVATE_V4.addSubnet('169.254.0.0', 16, 'ipv4')
PRIVATE_V4.addSubnet('172.16.0.0', 12, 'ipv4')
PRIVATE_V4.addSubnet('192.168.0.0', 16, 'ipv4')
PRIVATE_V4.addSubnet('198.18.0.0', 15, 'ipv4')
PRIVATE_V4.addSubnet('224.0.0.0', 4, 'ipv4')
PRIVATE_V4.addSubnet('240.0.0.0', 4, 'ipv4')

const PRIVATE_V6 = new BlockList()
PRIVATE_V6.addSubnet('::1', 128, 'ipv6')
PRIVATE_V6.addSubnet('::', 128, 'ipv6')
PRIVATE_V6.addSubnet('fc00::', 7, 'ipv6')
PRIVATE_V6.addSubnet('fe80::', 10, 'ipv6')
PRIVATE_V6.addSubnet('64:ff9b::', 96, 'ipv6')
// Another way to write an IPv4 address in IPv6 (::ffff:0:a.b.c.d), never a real website
PRIVATE_V6.addSubnet('::ffff:0:0:0', 96, 'ipv6')

// "[::1]" (how a URL writes an IPv6 address) becomes "::1"
export function bareHost(host: string): string {
  return host.replace(/^\[|\]$/g, '').toLowerCase()
}

// "::ffff:7f00:1" or "::ffff:127.0.0.1" hide an IPv4 address inside an IPv6 one.
// Returns that IPv4 address, or null when there isn't one.
function hiddenV4(v6: string): string | null {
  // Turn a dotted end ("::ffff:127.0.0.1") into two hex groups first
  let text = v6
  const dotted = /(\d+\.\d+\.\d+\.\d+)$/.exec(text)
  if (dotted) {
    const [a, b, c, d] = dotted[1].split('.').map(Number)
    text = text.slice(0, -dotted[1].length) + `${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`
  }
  // Fill in the "::" so there are always 8 groups
  const [head, tail] = text.split('::')
  const left = head ? head.split(':') : []
  const right = tail !== undefined && tail !== '' ? tail.split(':') : []
  const groups = tail === undefined ? left : [...left, ...Array(8 - left.length - right.length).fill('0'), ...right]
  if (groups.length !== 8) return null
  const n = groups.map((g) => parseInt(g || '0', 16))
  // ::ffff:a.b.c.d (mapped) or ::a.b.c.d (the old "compatible" form)
  const mapped = n.slice(0, 5).every((x) => x === 0) && (n[5] === 0xffff || n[5] === 0)
  if (!mapped || (n[5] === 0 && n[6] === 0)) return null
  return [n[6] >> 8, n[6] & 255, n[7] >> 8, n[7] & 255].join('.')
}

// True for an IP address on this computer or a home/office network
export function isPrivateIp(address: string): boolean {
  const ip = bareHost(address)
  const kind = isIP(ip)
  if (kind === 4) return PRIVATE_V4.check(ip, 'ipv4')
  if (kind === 6) {
    const v4 = hiddenV4(ip)
    if (v4) return PRIVATE_V4.check(v4, 'ipv4')
    return PRIVATE_V6.check(ip, 'ipv6')
  }
  // Not an IP address at all: not for this check to say yes to
  return true
}

// Names that never lead to a public website: "localhost", "printer.local", or a single
// word like "router" (those are looked up on the home network)
export function isLocalName(host: string): boolean {
  const name = bareHost(host).replace(/\.$/, '')
  if (isIP(name)) return false
  return (
    !name ||
    name === 'localhost' ||
    name.endsWith('.localhost') ||
    name.endsWith('.local') ||
    !name.includes('.')
  )
}

// A logo copied from the page as SVG code: take out anything that could run.
// Repeats until nothing changes, so pieces can't join up into a new <script> after one pass.
export function cleanSvg(svg: string): string {
  let out = svg
  let before: string
  do {
    before = out
    out = out
      // <script> and <foreignObject> (which can hold a whole web page) with what's inside
      .replace(/<(script|foreignObject)\b[\s\S]*?<\/\1\s*>/gi, '')
      .replace(/<\/?(script|foreignObject)\b[^>]*>/gi, '')
      // "<svg/onload=...>" is read like "<svg onload=...>": add the space so the next lines see it
      .replace(/<([a-z][\w:-]*)\/+(?=[a-z])/gi, '<$1 ')
      // onload="...", onclick=... and the like
      .replace(/\son[a-z0-9_-]*\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, ' ')
      // Any attribute whose value mentions javascript:
      .replace(/\s[a-z0-9_:-]+\s*=\s*("[^"]*javascript:[^"]*"|'[^']*javascript:[^']*'|javascript:[^\s>]*)/gi, ' ')
      // Links that go anywhere except inside the logo (#id) or to a picture
      .replace(/\s(?:xlink:)?href\s*=\s*("(?!#|data:image\/|https?:)[^"]*"|'(?!#|data:image\/|https?:)[^']*'|(?!["'#]|data:image\/|https?:)[^\s>]+)/gi, ' ')
  } while (out !== before)
  return out
}
