import re
import random


def term_root(term):
    return term.split('|')[0] if '|' in term else term

def fill_pattern(pattern, terms, roots=None):
    roots = roots or []
    for k in re.findall('{[a-z]+}', pattern):
        key = k[1:-1]
        opts = [t for t in terms[key] if term_root(t) not in roots]
        if not opts: # fallback to allowing repetition
            opts = terms[key]
        term = random.choice(opts)
        roots.append(term_root(term))
        term = term.replace('|', '') # remove root demarcation
        term = fill_pattern(term, terms, roots)
        pattern = pattern.replace(k, term, 1)
    return pattern

def generate(terms_file, n=10):
    terms = {}
    for l in open(terms_file, 'r').read().splitlines():
        if not l: continue
        if l.startswith('# '):
            key = l.strip('# ')
            terms[key] = []
        else:
            terms[key].append(l)

    starts = terms.pop('start')
    for _ in range(n):
        yield fill_pattern(random.choice(starts), terms)

def generate_html(terms_file, outfile, side=3):
    futures = generate(terms_file, n=side**2)
    size = side * 200;

    html = '''
    <html>
    <head>
        <title>collider</title>
        <style>
            body {{
                background: #111;
                color: #fff;
            }}
            .grid {{
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                text-align: center;
                text-transform: uppercase;
                border: 1px solid #fff;
                width: {size}px;
                height: {size}px;
                margin: 1em auto;
            }}
            .grid > div {{
                border: 1px solid #fff;
                display: flex;
                align-items: center;
                padding: 0.5em;
            }}
        </style>
    </head>
    <body>
        <div class="grid">{items}</div>
    </body>
    </html>
    '''.format(
        size=size,
        items='\n'.join(['<div>{}</div>'.format(fut) for fut in futures]))

    with open(outfile, 'w') as f:
        f.write(html)


if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        typ = sys.argv[1]
    else:
        typ = 'text'

    if typ == 'html':
        generate_html('terms.txt', 'index.html', side=3)
    else:
        for future in generate('terms.txt', n=10):
            print(future)