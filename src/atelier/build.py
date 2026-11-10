import os as _os
_os.chdir(_os.path.dirname(_os.path.abspath(__file__))) if '__file__' in globals() else None;_os.makedirs('dist',exist_ok=True)
REPO=_os.path.abspath('../..')  # the repository root (this file lives in src/<app>/)
import base64,glob
FD='fonts'
R={'latin':'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD','latin-ext':'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'}
def ff(path,fam,w,sub,st='normal'):
    return "@font-face{font-family:'%s';font-style:%s;font-weight:%s;font-display:block;src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s}"%(fam,st,w,base64.b64encode(open(path,'rb').read()).decode(),R[sub])
F=[]
for sub in ('latin','latin-ext'):
    F.append(ff(glob.glob(f'{FD}/fontsource-newsreader-*/package/files/newsreader-{sub}-400-normal.woff2')[0],'Newsreader',400,sub))
    for w in (400,500,600,700): F.append(ff(glob.glob(f'{FD}/fontsource-instrument-sans-*/package/files/instrument-sans-{sub}-{w}-normal.woff2')[0],'Instrument Sans',w,sub))
    F.append(ff(f'f/package/files/caveat-{sub}-600-normal.woff2','Caveat',600,sub))
JS=['art.js','core.js','people.js','today.js','focus.js','notes.js','chat.js','projects.js','study.js','pulse.js','school.js','widgets.js','rewards.js','you.js']
js='\n'.join(open(f).read() for f in JS)
out=open('shell.html').read().replace('/*FONTS*/','\n'.join(F))+'<script>\n'+js+'\n</script>\n</body>\n</html>\n'
open('dist/atelier.html','w').write(out);print(len(out)//1024,'KB')
