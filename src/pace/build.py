#!/usr/bin/env python3
"""Builds the single-file PACE app into dist/pace.html and copies it, with the PWA files, to ../../pace/."""
import os, re, shutil, subprocess
here = os.path.dirname(os.path.abspath(__file__))
rd = lambda f: open(os.path.join(here, f), encoding='utf-8').read()
strip_export = lambda s: re.sub(r"\nif \(typeof module !== 'undefined'\) module.exports = \w+;\n?", "\n", s)
html = rd('shell.html')
html = html.replace('/*CSS*/', rd('style.css')).replace('/*MASCOT*/', strip_export(rd('mascot.js'))).replace('/*STORE*/', strip_export(rd('store.js'))).replace('/*APP*/', rd('app.js'))
os.makedirs(os.path.join(here, 'dist'), exist_ok=True)
open(os.path.join(here, 'dist', 'pace.html'), 'w', encoding='utf-8').write(html)
out = os.path.join(here, '..', '..', 'pace')
os.makedirs(out, exist_ok=True)
shutil.copy(os.path.join(here, 'dist', 'pace.html'), os.path.join(out, 'index.html'))
for f in ['manifest.webmanifest', 'sw.js']:
    shutil.copy(os.path.join(here, 'pwa', f), os.path.join(out, f))
# icons from the logo
logo = os.path.join(here, 'logo.svg'); full = os.path.join(here, 'logo-full.svg')
for n, s in [('icon-180.png', 180), ('icon-192.png', 192), ('icon-512.png', 512)]:
    subprocess.check_call(['rsvg-convert', '-w', str(s), '-h', str(s), full, '-o', os.path.join(out, n)])
shutil.copy(logo, os.path.join(out, 'icon.svg'))
print('built', len(html) // 1024, 'KB')
