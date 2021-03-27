# `collider`

accelerationist-compass future generator

## Usage

First, edit terms in `terms.txt`. The basic format is:

```
# start
value a
value {sub_pattern}

# sub_pattern
b
c
```

This yields `value a`, `value b`, or `value c`.

Note how sub patterns can be referenced. These can contain terms or other patterns.

The `start` pattern is the only special pattern name; it's where the program selects the initial pattern to fill out.

To avoid redundancy/repetition, you can use `|` to demarcate term "roots". When filling out a pattern, the program will avoid using terms with the same roots as already selected terms:

```
# start
sustain|able
militar|ized

# sub_pattern
sustain|ability
militar|y
```

This will only generate either `sustainable military` or `militarized sustainability`.

See `terms.txt` for a more comprehensive example. Feel free to open a PR to add more terms!

Then run `python main.py`

## Example Output

```
anarcho-automated union-owned eden
platform labor revolution
platform worker utopia
toxic automation corporatism
survivalist war kingdoms
hypo-commodified union-free colonies
hypo-colonial protest democracy
neo-agrarian time patchwork
anti-platform soul colonies
post-financial welfare-owned colonies
```
