import json, os, re

BASE = os.path.join(os.path.dirname(__file__), '..', 'messages')

def sanitize_filename(key):
    return re.sub(r'\s+', '_', key)

def split_file(locale):
    src = os.path.join(BASE, f'{locale}.json')
    dst_dir = os.path.join(BASE, locale)
    os.makedirs(dst_dir, exist_ok=True)

    with open(src, encoding='utf-8') as f:
        data = json.load(f)

    for key, value in data.items():
        filename = sanitize_filename(key) + '.json'
        filepath = os.path.join(dst_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(value, f, ensure_ascii=False, indent=2)
        print(f'  Created {locale}/{filename}')

def generate_index(locale, keys):
    dst_dir = os.path.join(BASE, locale)
    
    lines = ['// Auto-generated. Do not edit.\n']
    import_lines = []
    merge_entries = []
    
    for key in keys:
        safe = sanitize_filename(key)
        import_lines.append(f'import {safe} from \'./{safe}.json\';')
        if key != safe:
            merge_entries.append(f'  "{key}": {safe},')
        else:
            merge_entries.append(f'  {safe},')
    
    lines.extend(import_lines)
    lines.append('')
    lines.append('const messages: Record<string, unknown> = {')
    lines.extend(merge_entries)
    lines.append('};')
    lines.append('')
    lines.append('export default messages;')
    lines.append('')
    
    content = '\n'.join(lines)
    filepath = os.path.join(dst_dir, 'index.ts')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  Created {locale}/index.ts')

# Read keys from en.json (canonical order)
with open(os.path.join(BASE, 'en.json'), encoding='utf-8') as f:
    en_data = json.load(f)
keys = list(en_data.keys())

for loc in ['en', 'vi']:
    print(f'Splitting {loc}.json...')
    split_file(loc)
    print(f'Generating {loc}/index.ts...')
    generate_index(loc, keys)

print('Done!')
