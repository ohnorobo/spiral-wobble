  function exportCurrentSVG(filename = 'drawing.svg') {
    let svgElement = document.querySelector('svg');
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