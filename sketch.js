let NOISEMAX = 1000;

let params = {
    turns: 45,
    spacing: 1,
    lineWeight: 2,
    wobbleStrength: 5,
    noiseSeed: 0,
    exportSVG: function() { exportCurrentSVG('spiral.svg'); }
  };
  
  function setup() {
    const canvas = createCanvas(600, 600, SVG);
    canvas.parent(select('div[p5]'));

    noFill();
    stroke(0);
    strokeWeight(params.lineWeight);
  
    setupGUI();
  }
  
  function draw() {
    clear();
    noiseSeed(params.noiseSeed);
    strokeWeight(params.lineWeight);
    
    // start in the center
    translate(width / 2, height / 2);

    beginShape();
    let angleStep = 0.1;
    for (let angle = 0; angle < params.turns * TWO_PI; angle += angleStep) {
      // Archimedian spiral
      let radius = params.spacing * angle;
      let spiralX = radius * cos(angle)
      let spiralY = radius * sin(angle)

      // Get perlin noise to create a wobbly effect
      let noiseX = noise(angle);
      let noiseY = noise(angle+100);
      noiseX = map(noiseX, 0, 1, -1, 1); // Map noise from 0-1 to -1-1
      noiseY = map(noiseY, 0, 1, -1, 1);
      
      x = spiralX + noiseX * params.wobbleStrength;
      y = spiralY + noiseY * params.wobbleStrength;
      vertex(x, y);
    }
    endShape();
  }
  
  function setupGUI() {
    const gui = new dat.GUI();
    gui.add(params, 'turns', 1, 100, 1).name('Turns').onChange(redraw);
    gui.add(params, 'spacing', 1, 20, 1).name('Spacing').onChange(redraw);
    gui.add(params, 'lineWeight', 1, 10, 1).name('Line Weight').onChange(redraw);
    gui.add(params, 'wobbleStrength', 0, 50, 1).name('Wobble Strength').onChange(redraw);

    // Add a button to randomize noiseSeed
    gui.add(params, 'noiseSeed', 0, NOISEMAX, 1).name('Noise Seed (Current)').listen(); // Keep current value visible
    gui.add({ randomize: () => { params.noiseSeed = floor(random(0, NOISEMAX + 1)); redraw(); } }, 'randomize').name('Randomize Noise Seed');
    
    gui.add(params, 'exportSVG').name('Export SVG');
    noLoop(); // only redraw when parameters change
  }
  