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
{a} {b}

# a
sustain|able
militar|ized

# b
sustain|ability
militar|y
```

This will only generate either `sustainable military` or `militarized sustainability`.

See `terms.txt` for a more comprehensive example. Feel free to open a PR to add more terms!

Then run `python main.py`

## Example Output

```
anarcho-communal welfare-free patchwork
psychadelic livestreamed federation
commodified worker-free technocracy
solar consumer-owned gig economy
hypo-peaceful worker-owned federalism
exa-colonial extreme weather federalism
techno-sustainable civ-free communes
anarcho-psychadelic welfare-owned revolution
occult union kingdoms
pseudo-occult soul earth
```

## Rendering to web

Run `python main.py html`. This will create `index.html`, with contents like:

![](example.png)

The only problem is the future generation has no "spatial" aspect to it, so the axes don't mean anything!

## Infinite Fields

The `fields/` directory has a javascript implementation and shows an infinite compass. It will generate new futures as you pan around

View it at [fields.spaceandtim.es](http://fields.spaceandtim.es/)
