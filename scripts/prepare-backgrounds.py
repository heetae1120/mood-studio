import json
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
collection = root.parent / 'background-collection-30'
destination = root / 'public/assets/backgrounds'
destination.mkdir(parents=True, exist_ok=True)
photos = []
for item in json.loads((collection / 'sources.json').read_text(encoding='utf-8'))['files']:
    key = f"{item['number']:02d}"
    with Image.open(collection / item['file']) as original:
        image = ImageOps.exif_transpose(original).convert('RGB')
        image.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
        image.save(destination / f'{key}.jpg', quality=87, optimize=True)
        thumb = ImageOps.fit(image, (400, 300), method=Image.Resampling.LANCZOS)
        thumb.save(destination / f'{key}-thumb.jpg', quality=80, optimize=True)
    photos.append(dict(id=item['id'], region=item['region'], name=item['label'].replace('_', ' '), mood=item['mood'], note=item['note'], suitability=item['suitability'], author=item['author'], source=item['page'], license=item['license'], image=f'assets/backgrounds/{key}.jpg', thumbnail=f'assets/backgrounds/{key}-thumb.jpg'))
(destination / 'catalog.json').write_text(json.dumps(photos, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Prepared {len(photos)} backgrounds and thumbnails')
