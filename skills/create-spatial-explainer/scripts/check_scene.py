#!/usr/bin/env python3
"""Check starter delivery structure and local module references."""
import argparse
from pathlib import Path
import re
import json

p=argparse.ArgumentParser();p.add_argument('directory',type=Path);a=p.parse_args();r=a.directory.resolve()
issues=[]
for item in ['index.html','SCENE_SPEC.json','runtime/viewer.mjs','runtime/playback.mjs','templates/catalog.mjs']:
    if not (r/item).is_file():issues.append('Missing '+item)
if (r/'index.html').exists() and '__SCENE_ID__' in (r/'index.html').read_text():issues.append('Unresolved scene placeholder')
for f in r.rglob('*.mjs'):
    for ref in re.findall(r'''(?:from\s*|import\s*\()(['"])(\.[^'"\n]+)\1''',f.read_text()):
        value=ref[1]
        if '${' not in value and not (f.parent/value).resolve().is_file():issues.append(f'Missing import in {f.relative_to(r)}: {value}')
if issues:
    raise SystemExit('\n'.join(issues))
print('PASS: delivery structure and local references. This does not verify subject correctness or browser interaction.')
