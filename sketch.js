const width = 700;
const height = 700;
let noisemax = 1000;

function drawSpiral() {
  // start in the center
  translate(width / 2, height / 2);

  beginShape();

  let angle = 0.1; // start a bit above 0 to avoid division by zero
  let radius = 0;
  let totalSegments = 0;
  // angle increases above 360 degrees to create multiple turns
  // stop if we're way off the canvas
  while (angle < params.turns * TWO_PI && abs(radius) < width) {
    // Archimedian spiral
    radius = params.spacing * angle;

    let spiralX = radius * cos(angle)
    let spiralY = radius * sin(angle)

    let noiseX = noise(spiralX * params.noiseScale, spiralY * params.noiseScale)
    // independant noise value
    let noiseY = noise((spiralX + 10000) * params.noiseScale, (spiralY + 10000) * params.noiseScale)
    // map noise from 0-1 to -1 to 1
    noiseX = map(noiseX, 0, 1, -1, 1);
    noiseY = map(noiseY, 0, 1, -1, 1);

    let x = spiralX + noiseX * params.wobbleStrength;
    let y = spiralY + noiseY * params.wobbleStrength;
    vertex(x, y);

    // Make the angle step inversely proportional to the radius
    // Add a minimum value for performance
    const angleStep = min(1, params.stepLength / radius);
    angle += angleStep;

    totalSegments++;
  }
  endShape();

  console.log(`Drew ${totalSegments} segments`);
}

function setup() {
  const canvas = createCanvas(width, height, SVG);
  canvas.parent(select('div[p5]'));

  noFill();
  stroke(0);

  setupGUI();
}

function draw() {
  clear(); // clear canvas for SVG redraw
  noiseSeed(params.noiseSeed);
  strokeWeight(params.lineWeight);

  // Draw registration mark first in file
  if (params.drawRegistrationMark) {
    drawRegistrationMark();
  }

  drawShapeInsideBorder(drawSpiral);
}

function drawShapeInsideBorder(shapeDrawingFunction) {
  // clip the shape inside the SVG border
  push();
  function mask() {
    rect(params.border,
      params.border,
      width - params.border*2,
      height - params.border*2)
  }
  clip(mask);

  shapeDrawingFunction();

  pop();
}

function drawRegistrationMark() {
  const circleSize = 25;
  const crosshairSize = 40;
  const center = crosshairSize / 2;

  ellipse(center, center, circleSize, circleSize);
 
  line(center - crosshairSize / 2, center, center + crosshairSize / 2, center); // Horizontal
  line(center, center - crosshairSize / 2, center, center + crosshairSize / 2); // Vertical
}

let params = {
  turns: 45,
  spacing: 1,
  stepLength: 15,
  lineWeight: 2,
  wobbleStrength: 25,
  noiseScale: 0.025,
  noiseSeed: 0,
  border: 50,
  drawRegistrationMark: true,
  exportSVG: function() { exportCurrentSVG('spiral.svg'); }
};

function setupGUI() {
  const gui = new dat.GUI();
  // only redraw once the slider has finished moving
  const redrawOnFinish = () => redraw();

  gui.add(params, 'turns', 1, 100, 1).name('Turns').onFinishChange(redrawOnFinish);
  gui.add(params, 'spacing', 0, 20, 1).name('Spacing').onFinishChange(redrawOnFinish);
  gui.add(params, 'stepLength', 1, 20, 1).name('Step Length').onFinishChange(redrawOnFinish);
  gui.add(params, 'lineWeight', 1, 10, 1).name('Line Weight').onFinishChange(redrawOnFinish);
  gui.add(params, 'wobbleStrength', 0, 50, 1).name('Wobble Strength').onFinishChange(redrawOnFinish);
  gui.add(params, 'noiseScale', 0.001, 0.1, 0.001).name('Noise Scale').onFinishChange(redrawOnFinish);
  
  gui.add(params, 'border', 0, 100, 1).name('Border').onFinishChange(redrawOnFinish);
  gui.add(params, 'drawRegistrationMark').name('Registration').onFinishChange(redrawOnFinish);
  
  // Add a button to randomize noiseSeed
  // gui.add(params, 'noiseSeed', 0, noisemax, 1).name('Noise Seed (Current)').listen(); // Keep current value visible
  gui.add({ randomize: () => { params.noiseSeed = floor(random(0, noisemax + 1)); redraw(); } }, 'randomize').name('Randomize Noise Seed');
  
  gui.add(params, 'exportSVG').name('Export SVG');
  noLoop(); // only redraw when parameters change
}
