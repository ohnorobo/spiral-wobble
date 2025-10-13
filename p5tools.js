function exportCurrentSVG(filename = 'drawing.svg') {
  let origSvgElement = document.querySelector('svg');

  svgElement = clipSVGPaths(origSvgElement); 

  if (svgElement) {
      let serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgElement);
      let blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      let url = URL.createObjectURL(blob);
      let link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  } else {
      console.error('No SVG element found for export.');
  }
}

// Adapted from https://gist.github.com/akre54/4d9ace17fb27d0507a6c790be5047e3d
function clipSVGPaths(origSvgElement) {
  // Create a deep clone of the SVG element to avoid modifying the original.
  const svgElement = origSvgElement.cloneNode(true);

  // Paper.js works on a canvas, so we create a hidden one.
  const paperCanvas = document.createElement('canvas');
  paperCanvas.style.display = 'none';
  paper.setup(paperCanvas);

  // Find all elements that have a clip-path or mask applied.
  const clipPathElements = svgElement.querySelectorAll('[clip-path], [mask]');
  // A map to cache the geometry of each clip path so we don't re-process it.
  const elementMap = new Map();

  // First pass: Go through all clipped elements to find their associated
  // <clipPath> definitions, convert them to Paper.js paths, and cache them.
  clipPathElements.forEach(element => {
    const clipPathAttr = element.getAttribute('clip-path') || element.getAttribute('mask');

    // Extract the ID from the "url(#elementId)" string.
    const elementId = clipPathAttr.match(/\#(.+?)\)/)[1];
    const clipPathElement = document.getElementById(elementId);

    // If we haven't processed this clip path definition yet...
    if (!elementMap.has(elementId)) {
      // Find all <path>s inside the <clipPath> definition.
      const pathElements = clipPathElement.querySelectorAll('path');

      // Combine all path 'd' attributes into a single string for Paper.js.
      const path = new paper.Path(
        [].map.call(pathElements, p => p.getAttribute('d')).join(' ')
      );

      // Cache the resulting path data, keyed by the clip path ID.
      elementMap.set(elementId, path.pathData);
    }
  });

  // Second pass: Apply the cached clip paths to the actual elements.
  clipPathElements.forEach(element => {
    // Get the clip path ID and its corresponding cached path data.
    const clipPathAttr = element.getAttribute('clip-path') || element.getAttribute('mask');
    const elementId = clipPathAttr.match(/\#(.+?)\)/)[1];
    const clipPathData = elementMap.get(elementId);

    // Remove the original clip-path/mask attributes as we're replacing them.
    element.removeAttribute('clip-path');
    element.removeAttribute('mask');

    // Find all paths within the element that needs to be clipped.
    const pathElements = element.querySelectorAll('path');

    // Combine the element's paths into a single Paper.js path.
    const path = new paper.Path(
      [].map.call(pathElements, p => p.getAttribute('d')).join(' ')
    );

    // Create the clipping path and the content path in Paper.js.
    const clipPath = new paper.Path(clipPathData);
    // Calculate the geometric intersection. This is the "clipping" operation.
    const intersection = path.intersect(clipPath, { trace: false });

    // Get style attributes from the first original path to apply to the new one.
    const originalStyleSource = pathElements.length > 0 ? pathElements[0] : element;

    // Create a new <path> element to hold the result of the intersection.
    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('d', intersection.pathData);
    pathElement.setAttribute('fill', originalStyleSource.getAttribute('fill') || 'none');
    pathElement.setAttribute('stroke', originalStyleSource.getAttribute('stroke') || 'black');
    pathElement.setAttribute('stroke-width', originalStyleSource.getAttribute('stroke-width') || '1');
    pathElement.setAttribute('data-clipped', true);

    element.appendChild(pathElement);
  });

  // --- Cleanup ---
  // Remove the <defs> section which contained the original <clipPath> definitions.
  // Also remove the original paths that have now been replaced.
  clipPathElements.forEach(element => element.querySelectorAll('path:not([data-clipped])').forEach(p => p.remove()));

  const defs = svgElement.querySelector('defs');
  if (defs) {
    defs.remove();
  }

  // Remove any paths that were likely used for masking or background fills.
  svgElement.querySelectorAll('path[fill="#FFF"]').forEach(n => n.remove())

  return svgElement;
}