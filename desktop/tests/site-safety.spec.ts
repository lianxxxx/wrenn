// The address and logo checks for "Grab from my site". Plain functions, no app window.

import { expect, test } from '@playwright/test'
import { cleanSvg, isLocalName, isPrivateIp } from '../src/main/siteSafety'

test('addresses on this computer or the home network are private', () => {
  for (const ip of [
    '0.0.0.0',
    '10.1.2.3',
    '100.64.0.1',
    '127.0.0.1',
    '169.254.169.254',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '198.18.0.1',
    '224.0.0.1',
    '255.255.255.255',
    '::1',
    '::',
    '[::1]',
    'fc00::1',
    'fd12:3456::1',
    'fe80::1',
    '64:ff9b::7f00:1'
  ]) {
    expect(isPrivateIp(ip), ip).toBe(true)
  }
})

test('IPv4 hidden inside IPv6 is checked as IPv4', () => {
  // What new URL('http://[::ffff:127.0.0.1]/').hostname gives
  expect(new URL('http://[::ffff:127.0.0.1]/').hostname).toBe('[::ffff:7f00:1]')
  for (const ip of ['[::ffff:7f00:1]', '::ffff:7f00:1', '::ffff:127.0.0.1', '::ffff:192.168.0.1', '::ffff:c0a8:1', '::ffff:0:a00:1', '::127.0.0.1']) {
    expect(isPrivateIp(ip), ip).toBe(true)
  }
  expect(isPrivateIp('::ffff:8.8.8.8')).toBe(false)
  expect(isPrivateIp('::ffff:808:808')).toBe(false)
})

test('public addresses are not private', () => {
  for (const ip of ['8.8.8.8', '1.1.1.1', '172.32.0.1', '100.128.0.1', '2606:4700:4700::1111', '[2001:4860:4860::8888]']) {
    expect(isPrivateIp(ip), ip).toBe(false)
  }
})

test('local names are turned down, real domains are not', () => {
  for (const name of ['localhost', 'app.localhost', 'printer.local', 'router', 'router.', '']) {
    expect(isLocalName(name), name).toBe(true)
  }
  for (const name of ['example.com', 'www.wrenn.app', '8.8.8.8']) {
    expect(isLocalName(name), name).toBe(false)
  }
})

test('SVG logos lose anything that could run', () => {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(2)</script>' +
    '<scr<script></script>ipt>alert(3)</script>' +
    '<a href="javascript:alert(4)"><circle r="4" onclick=\'alert(5)\'/></a>' +
    '<a xlink:href="java&#115;cript:alert(6)"><rect/></a>' +
    '<set attributeName="href" to="javascript:alert(7)"/>' +
    '<foreignObject><iframe src="https://example.com"></iframe></foreignObject>' +
    '<use href="#mark"/><image href="https://example.com/a.png"/><path d="M0 0h4"/></svg>'
  const clean = cleanSvg(svg)
  expect(clean).not.toMatch(/<script/i)
  expect(clean).not.toMatch(/\son\w+\s*=/i)
  expect(clean).not.toMatch(/javascript:/i)
  expect(clean).not.toMatch(/java&#115;cript/i)
  expect(clean).not.toMatch(/foreignObject|iframe/i)
  // The safe parts stay
  expect(clean).toContain('xmlns="http://www.w3.org/2000/svg"')
  expect(clean).toContain('href="#mark"')
  expect(clean).toContain('href="https://example.com/a.png"')
  expect(clean).toContain('<path d="M0 0h4"/>')
})
