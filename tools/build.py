#!/usr/bin/env python3
"""Bundle app/ into one self-contained HTML file.

  python3 tools/build.py                  -> dist/index.html (full document, for hosting)
  python3 tools/build.py --fragment OUT   -> page body without <html>/<head>/<body> wrappers
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = ROOT / "app"

def bundle():
    html = (APP / "index.html").read_text(encoding="utf-8")
    html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">',
                  lambda m: "<style>\n" + (APP / m.group(1)).read_text(encoding="utf-8") + "</style>", html)
    html = re.sub(r'<script src="([^"]+)"></script>',
                  lambda m: "<script>\n" + (APP / m.group(1)).read_text(encoding="utf-8").replace("</script", "<\\/script") + "\n</script>", html)
    return html

def fragment(html):
    for tag in ["<!doctype html>", '<html lang="en-GB">', "<head>", "</head>", "<body>", "</body>", "</html>"]:
        html = html.replace(tag, "", 1)
    return re.sub(r'<meta charset="utf-8"><meta name="viewport"[^>]*>', "", html, count=1)

if __name__ == "__main__":
    out = bundle()
    if len(sys.argv) == 3 and sys.argv[1] == "--fragment":
        pathlib.Path(sys.argv[2]).write_text(fragment(out), encoding="utf-8")
    else:
        (ROOT / "dist").mkdir(exist_ok=True)
        (ROOT / "dist" / "index.html").write_text(out, encoding="utf-8")
        print("Wrote dist/index.html")
