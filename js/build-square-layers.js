const buildSquareLayers = (lineFeature) => {
  // takes a GeoJson LineString Feature with two vertices
  // returns mapboxGL layers to show a right angle symbol
  const { id } = lineFeature;

  const { coordinates } = lineFeature.geometry;
  const lineBearing = bearing(coordinates[0], coordinates[1]);
  const lineLength = length(lineFeature) // get length of original line
  const segmentLength = lineLength * .667
  const midPoint = along(lineFeature,segmentLength).geometry.coordinates; // get coordinates for the center of the original line

  // pythagorean theorum!
  const wingDistance = (segmentLength * Math.sqrt(2)) / 2;

  // start with the center point of the line, and project away at a bearing + 135 degrees
  const rightWingVertex = destination(midPoint, wingDistance, lineBearing + 135).geometry.coordinates
  const leftWingVertex = destination(midPoint, wingDistance, lineBearing - 135).geometry.coordinates


  const squareLayer = {
    id: `${id}-annotation-square`,
    type: 'line',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            leftWingVertex,
            midPoint,
            rightWingVertex,
          ]
        }
      },
    }
  }

  // const layer = {
  //   id: 'baz',
  //   type: 'line',
  //   source: {
  //     type: 'geojson',
  //     data: lineFeature,
  //   }
  // }
  return [
    // layer,
    squareLayer,
  ];
}
