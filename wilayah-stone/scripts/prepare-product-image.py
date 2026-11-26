"""Create web delivery sizes from the unmodified generated source image."""
from pathlib import Path
import argparse
import hashlib
import json
import re
from PIL import Image, ImageOps

parser = argparse.ArgumentParser()
parser.add_argument('--source', required=True)
parser.add_argument('--id', required=True)
args = parser.parse_args()
if not re.fullmatch(r'WS-[1-8][0-9]{2}', args.id):
    raise SystemExit('Invalid product identifier')
source = Path(args.source)
root = Path(__file__).resolve().parent.parent
dest = root / 'public/assets/products'
dest.mkdir(parents=True, exist_ok=True)
image = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
if min(image.size) < 960:
    raise SystemExit('Source image is smaller than the delivery requirement')
if abs(image.width / image.height - 1) > 0.03:
    raise SystemExit('Expected a square catalogue image')
outputs = []
for width in (480, 960):
    target = dest / f'{args.id.lower()}-{width}.webp'
    resized = image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
    resized.save(target, 'WEBP', quality=88, method=6)
    outputs.append({'path': str(target.relative_to(root)), 'bytes': target.stat().st_size})
print(json.dumps({'id': args.id, 'source': str(source), 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'outputs': outputs}))
