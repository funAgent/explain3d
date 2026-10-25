#!/usr/bin/env python3
"""Copy a local, self-contained scene starter without overwriting user work."""
import argparse
import json
from pathlib import Path
import shutil

parser = argparse.ArgumentParser()
parser.add_argument('--template', choices=['planetary','slider-crank','escapement','smart-ring','motor','lens','eclipse','attention','agent','conveyor'], required=True)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
target = args.output.resolve()
if target.exists() and any(target.iterdir()):
    parser.error('Output directory must be new or empty; no files were changed.')
starter = Path(__file__).resolve().parents[1] / 'assets' / 'starter'
shutil.copytree(starter, target, dirs_exist_ok=True)
p = target / 'index.html'
p.write_text(p.read_text().replace('__SCENE_ID__', args.template), encoding='utf-8')
(target/'SCENE_SPEC.json').write_text(json.dumps({'template':args.template,'question':'Define one explanation question before adapting this starter.','status':'template starter; new-topic constraints require implementation and verification','durationSeconds':10,'sources':[],'simplifications':[]},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Created {target}. Run: python3 -m http.server 8000 --directory {target}')
