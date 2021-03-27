const debug = false;
const padding = 10;
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
    let lines = [];
    let words = text.split(' ');
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      let word = words[i];
      let width = ctx.measureText(`${currentLine} ${word}`).width;
      if (width < maxWidth) {
        currentLine += ` ${word}`;
      } else {
        let height = textHeight;
        let width = ctx.measureText(currentLine).width;
        if (width > maxWidth) {
          height = maxWidth/width * textHeight;
        }
        lines.push({text: currentLine, height});
        currentLine = word;
      }
    }
  lines.push({text: currentLine, height: textHeight}); // TODO
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
    let startPan = ({clientX, clientY}) => {
      dragging = true;
      start = {
        x: parseInt(clientX - this.offset.x),
        y: parseInt(clientY - this.offset.y)
      };
    };
    let updatePan = ({clientX, clientY}) => {
      let mouse = {
        x: parseInt(clientX - this.offset.x),
        y: parseInt(clientY - this.offset.y)
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
    };
    this.offset = {x: rect.left, y: rect.top};
    this.canvas.addEventListener('mousedown', (ev) => startPan(ev));
    this.canvas.addEventListener('mouseup', () => dragging = false);
    this.canvas.addEventListener('mouseleave', () => dragging = false);
    this.canvas.addEventListener('mousemove', (ev) => updatePan(ev));
    this.canvas.addEventListener('touchstart', (ev) => startPan(ev.touches[0]));
    this.canvas.addEventListener('touchend', () => dragging = false);
    this.canvas.addEventListener('touchmove', (ev) => updatePan(ev.touches[0]));
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
        this.drawCell(fut, {x, y});
      }
    }
  }

  drawCell(fut, {x, y}) {
    // Draw cell square
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.rect(x, y, cellSize, cellSize);
    this.ctx.stroke();

    // Draw text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    if (debug) {
      this.ctx.fillText(`${i}, ${j}`, x + cellSize/2, y + cellSize/2);
    } else {
      let currHeight = 0;
      let text = fut.toUpperCase();
      let lines = getLines(this.ctx, text, cellSize - padding);
      let totalHeight = lines.reduce((acc, {height}) => acc + height, 0);
      lines.forEach(({text, height}, i) => {
        currHeight += height;
        this.ctx.font = `${height}px Arial`;
        this.ctx.fillText(text, x + cellSize/2, y + cellSize/2 - totalHeight/2 + currHeight);
      });
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