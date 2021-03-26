import re
import random

terms = {}
for l in open('terms.txt', 'r').read().splitlines():
    if not l: continue
    if l.startswith('#'):
        key = l.strip('# ')
        terms[key] = []
    else:
        terms[key].append(l)

def fill_pattern(pattern):
    for k in re.findall('{[a-z]+}', pattern):
        key = k[1:-1]
        term = random.choice(terms[key])
        term = fill_pattern(term)
        pattern = pattern.replace(k, term)
    return pattern

roots = terms.pop('root')
for _ in range(10):
    print(fill_pattern(random.choice(roots)))