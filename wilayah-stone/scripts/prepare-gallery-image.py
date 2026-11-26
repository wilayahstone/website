from pathlib import Path
import argparse,hashlib,json,re
from PIL import Image,ImageOps

parser=argparse.ArgumentParser()
parser.add_argument('--source',required=True)
parser.add_argument('--id',required=True)
parser.add_argument('--kind',choices=['ring','gemstone'],required=True)
args=parser.parse_args()
root=Path(__file__).resolve().parent.parent
if args.kind=='ring':
    if not re.fullmatch(r'WS-[1-8][0-9]{2}',args.id):raise SystemExit('Invalid product')
    dest=root/'public/assets/products';stem=args.id.lower()+'-detail';widths=(480,960)
else:
    if args.id not in ['aqeeq','firoza','durr-e-najaf','hadeed-e-chini','yaqoot','peridot','emerald','marjaan']:raise SystemExit('Invalid stone')
    dest=root/'public/assets/stones';stem=args.id;widths=(384,768)
dest.mkdir(parents=True,exist_ok=True)
source=Path(args.source)
image=ImageOps.exif_transpose(Image.open(source)).convert('RGBA' if args.kind=='gemstone' else 'RGB')
if min(image.size)<widths[-1]:raise SystemExit('Image is too small')
if abs(image.width/image.height-1)>.03:raise SystemExit('Expected a square image')
outputs=[]
for width in widths:
    target=dest/f'{stem}-{width}.webp'
    temporary=target.with_suffix('.tmp.webp')
    image.resize((width,width),Image.Resampling.LANCZOS).save(temporary,'WEBP',quality=88,method=5)
    temporary.replace(target)
    outputs.append({'path':str(target.relative_to(root)),'bytes':target.stat().st_size})
record={'id':args.id,'kind':args.kind,'sourceFile':source.name,'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'files':outputs}
record_dir=root/'docs/product-imagery/gallery-records';record_dir.mkdir(parents=True,exist_ok=True)
(record_dir/f'{args.id}.json').write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps(record))
