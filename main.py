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


if __name__ == '__main__':
    terms = {}
    for l in open('terms.txt', 'r').read().splitlines():
        if not l: continue
        if l.startswith('#'):
            key = l.strip('# ')
            terms[key] = []
        else:
            terms[key].append(l)

    starts = terms.pop('start')
    for _ in range(10):
        print(fill_pattern(random.choice(starts), terms))