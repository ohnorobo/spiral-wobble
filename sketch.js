const width = 700;
const height = 700;

let params = {
  turns: 5,
  spacing: 10,
  lineWeight: 2,
  border: 50,
  exportSVG: function() { exportCurrentSVG('spiral.svg'); }
};

function setup() {
  const canvas = createCanvas(width, height, SVG);
  canvas.parent(select('div[p5]'));

  noFill();
  stroke(0);
  strokeWeight(params.lineWeight);

  setupGUI();
}

function draw() {
  strokeWeight(params.lineWeight);

  clear(); // clear canvas for SVG redraw
  drawSpiral();
  drawRegistrationMark();
}

function drawSpiral() {
  // clip the shape inside the SVG border
  push();
  function mask() {
    rect(params.border,
      params.border,
      width - params.border*2,
      height - params.border*2)
  }
  clip(mask);

  // move to center
  translate(width/2, height/2);

  beginShape();
  let angleStep = 0.1;
  for (let a = 0; a < params.turns * TWO_PI; a += angleStep) {
    let r = params.spacing * a;
    let x = r * cos(a);
    let y = r * sin(a);
    vertex(x, y);
  }
  endShape();

  pop();
}

function drawRegistrationMark() {
  const circleSize = 30;
  const crosshairSize = 50;
  const center = crosshairSize / 2;

  ellipse(center, center, circleSize, circleSize);
 
  line(center - crosshairSize / 2, center, center + crosshairSize / 2, center); // Horizontal
  line(center, center - crosshairSize / 2, center, center + crosshairSize / 2); // Vertical
}

function setupGUI() {
  const gui = new dat.GUI();
  gui.add(params, 'turns', 1, 20, 1).name('Turns').onChange(redraw);
  gui.add(params, 'spacing', 1, 20, 1).name('Spacing').onChange(redraw);
  gui.add(params, 'lineWeight', 1, 10, 1).name('Line Weight').onChange(redraw);
  gui.add(params, 'border', 0, 100, 1).name('Border').onChange(redraw);
  gui.add(params, 'exportSVG').name('Export SVG');
  noLoop(); // only redraw when parameters change
}
