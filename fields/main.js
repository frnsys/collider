const debug = false;
const textHeight = 18;
const cellSize = 200;
const dpr = window.devicePixelRatio || 1;

function termRoot(term) {
  return term.split('|')[0];
}

function generate(terms) {
  let start = terms['start']
  let pattern = start[Math.floor(Math.random() * start.length)];
  return fillPattern(pattern, terms, []);
}

function fillPattern(pattern, terms, roots) {
  roots = roots || [];
  let matches = pattern.match(/{[a-z]+}/g) || [];
  [...matches].forEach((k) => {
    let key = k.slice(1, -1);
    let opts = terms[key].filter((t) => !roots.includes(termRoot(t)));
    if (opts.length == 0) { // Fallback to allowing repetition
      opts = terms[key];
    }
    let term = opts[Math.floor(Math.random() * opts.length)];
    roots.push(termRoot(term));
    term = term.replace('|', ''); // Remove root demarcation
    term = fillPattern(term, terms, roots);
    pattern = pattern.replace(k, term);
  });
  return pattern;
}

function getLines(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

class Fields {
  constructor(id, terms) {
    this.cells = {};
    this.terms = terms;
    this.canvas = document.getElementById(id);
    this.ctx = canvas.getContext('2d');

    this.pan = {x: 0, y: 0};
    window.onresize = () => this.resize();
    this.resize();

    // Panning
    let dragging = false;
    let start = {x: null, y: null};
    let rect = this.canvas.getBoundingClientRect();
    this.offset = {x: rect.left, y: rect.top};
    this.canvas.addEventListener('mousedown', (ev) => {
      dragging = true;
      start = {
        x: parseInt(ev.clientX - this.offset.x),
        y: parseInt(ev.clientY - this.offset.y)
      };
    });
    this.canvas.addEventListener('mouseup', () => dragging = false)
    this.canvas.addEventListener('mouseleave', () => dragging = false)
    this.canvas.addEventListener('mousemove', (ev) => {
      let mouse = {
        x: parseInt(ev.clientX - this.offset.x),
        y: parseInt(ev.clientY - this.offset.y)
      };

      if (dragging) {
        let dx = mouse.x - start.x;
        let dy = mouse.y - start.y;
        start = mouse;
        this.pan.x += dx;
        this.pan.y += dy;
        this.ctx.translate(dx, dy);
        this.draw();
      }
    });
  }

  resize() {
    let rect = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.ctx.scale(dpr, dpr);
    this.ctx.translate(this.pan.x, this.pan.y);
    this.draw();
  }

  draw() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    let bounds = [
      -this.pan.x - this.width/2,
      -this.pan.x + this.width/2,
      -this.pan.y - this.height/2,
      -this.pan.y + this.height/2,
    ];
    let ranges = {
      x: [Math.floor(bounds[0]/cellSize) - 1, Math.ceil(bounds[1]/cellSize) + 1],
      y: [Math.floor(bounds[2]/cellSize) - 1, Math.ceil(bounds[3]/cellSize) + 1]
    };

    for (let i=ranges.x[0]; i<ranges.x[1]; i++) {
      for (let j=ranges.y[0]; j<ranges.y[1]; j++) {
        if (!(i in this.cells)) {
          this.cells[i] = {};
        }
        if (this.cells[i][j] === undefined) {
          this.cells[i][j] = generate(this.terms);
        }
        let fut = this.cells[i][j];

        let x = (i * cellSize) + this.width/2 - cellSize/2;
        let y = (j * cellSize) + this.height/2 - cellSize/2;

        // Draw cell square
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.rect(x, y, cellSize, cellSize);
        this.ctx.stroke();

        // Draw text
        this.ctx.font = `${textHeight}px Arial`;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        if (debug) {
          this.ctx.fillText(`${i}, ${j}`, x + cellSize/2, y + cellSize/2);
        } else {
          let text = fut.toUpperCase();
          let lines = getLines(this.ctx, text, cellSize);
          let totalHeight = textHeight * lines.length;
          lines.forEach((line, i) => {
            this.ctx.fillText(line, x + cellSize/2, y + cellSize/2 - totalHeight/2 + (i+1) * textHeight);
          });
        }
      }
    }
  }
}

const terms = {};
fetch('terms.txt')
  .then((res) => res.text())
  .then((text) => {
    let key;
    text.split('\n').forEach((line) => {
      if (line.length > 0) {
        if (line.startsWith('# ')) {
          key = line.slice(2);
          terms[key] = [];
        } else {
          terms[key].push(line);
        }
      }
    });

    const fields = new Fields('canvas', terms);
  });