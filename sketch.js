let NOISEMAX = 1000;

let params = {
    turns: 45,
    spacing: 1,
    stepLength: 15,
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

      let noiseX = noise(spiralX, spiralY)
      // independant noise value
      let noiseY = noise(spiralX + 10000, spiralY + 10000)
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
    console.log("redrew shape")
  }
  
  function setupGUI() {
    const gui = new dat.GUI();
    gui.add(params, 'turns', 1, 100, 1).name('Turns').onFinishChange(redraw);
    gui.add(params, 'spacing', 0, 20, 1).name('Spacing').onFinishChange(redraw);
    gui.add(params, 'stepLength', 1, 20, 1).name('Step Length').onFinishChange(redraw);
    gui.add(params, 'lineWeight', 1, 10, 1).name('Line Weight').onFinishChange(redraw);
    gui.add(params, 'wobbleStrength', 0, 50, 1).name('Wobble Strength').onFinishChange(redraw);

    // Add a button to randomize noiseSeed
    gui.add(params, 'noiseSeed', 0, NOISEMAX, 1).name('Noise Seed (Current)').listen(); // Keep current value visible
    gui.add({ randomize: () => { params.noiseSeed = floor(random(0, NOISEMAX + 1)); redraw(); } }, 'randomize').name('Randomize Noise Seed');
    
    gui.add(params, 'exportSVG').name('Export SVG');
    noLoop(); // only redraw when parameters change
  }
  