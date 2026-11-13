"""Builds Mintora into one self-contained HTML file: dist/mintora.html (fonts embedded)."""
import os, base64
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs('dist', exist_ok=True)
FONTS = [('Space Grotesk', 'space-grotesk', (400, 500, 600, 700)), ('Instrument Sans', 'instrument-sans', (400, 500, 600, 700)),
         ('JetBrains Mono', 'jetbrains-mono', (400, 500)), ('Caveat', 'caveat', (600,))]
css = []
for fam, slug, ws in FONTS:
    for w in ws:
        b = base64.b64encode(open(f'fonts/{slug}-latin-{w}-normal.woff2', 'rb').read()).decode()
        css.append("@font-face{font-family:'%s';font-weight:%d;font-style:normal;font-display:block;src:url(data:font/woff2;base64,%s) format('woff2')}" % (fam, w, b))
JS = ['core.js', 'art.js', 'ui.js', 'data.js', 'dash.js', 'products.js', 'store.js', 'sales.js', 'work.js', 'hubs.js', 'credits.js', 'blueprint.js', 'settings.js', 'boot.js']
js = '\n'.join(f'/* ---- {f} ---- */\n' + open(f).read() for f in JS)
out = open('shell.html').read().replace('/*FONTS*/', '\n'.join(css)).replace('<!--JS-->', '<script>\n' + js + '\n</script>')
open('dist/mintora.html', 'w').write(out)
print(len(out) // 1024, 'KB')
