// this function takes a geojson LineString Feature
// and returns the mapboxGL layers necessary to display the various components
// the layers all carry their own sources, so no need to add sources separately beforehand

const getArrowLayers = (lineFeature, id) => {
  // calculate bearing
  const { coordinates } = lineFeature.geometry;
  const lineBearing = bearing(coordinates[0], coordinates[1]);

  // set common layout object
  const layout = {
    'icon-image': 'arrow',
    'icon-size': 0.04,
    'icon-rotate': {
      type: 'identity',
      property: 'rotation'
    },
    "icon-anchor": "top",
    "icon-rotation-alignment": "map",
  }

  const startArrowLayer = {
    id: `${id}-dimension-startarrow-symbol`,
    type: 'symbol',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: lineFeature.geometry.coordinates[0]
        },
        properties: {
          rotation: lineBearing + 180,
        }
      }
    },
    layout,
  };

  const endArrowLayer = {
    id: `${id}-dimension-endarrow-symbol`,
    type: 'symbol',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: lineFeature.geometry.coordinates[lineFeature.geometry.coordinates.length - 1]
        },
        properties: {
          rotation: lineBearing,
        }
      }
    },
    layout,
  };

  return [ startArrowLayer, endArrowLayer ];
}

const getCurve = (lineFeature) => {

  const { coordinates } = lineFeature.geometry;
  const lineBearing = bearing(coordinates[0], coordinates[1]);
  const lineLength = length(lineFeature)
  console.log(lineLength)

  const factor = -.04;
  const chunks = 4;
  const chunkLength = lineLength / chunks;
  console.log('CHunkLength', chunkLength)
  console.log('chunkLen', chunkLength * chunks)
  console.log('here', lineLength * 0.75)

  const center = along(lineFeature, lineLength / 2).geometry.coordinates;
  const newCoordinates = []

  for (let i = 1; i < (chunks); i++) {
    // for each vertice, get the distance along the line and the offset
    console.log(i);
    console.log(i * chunkLength);
    const originalCoordinate = along(lineFeature, (i * chunkLength) ).geometry.coordinates
    console.log(originalCoordinate)
    // x distance from center
    const distanceFromCenter = distance(originalCoordinate, center)
    // y
    const offsetLength = factor * (distanceFromCenter * distanceFromCenter) + distanceFromCenter;

    const offsetBearing = lineBearing - 90;

    console.log('originalCoordinate', originalCoordinate)
    console.log('Center', center)
    console.log('Distance', distanceFromCenter)

    const newCoordinate = destination(originalCoordinate, lineLength / 2, offsetBearing).geometry.coordinates;
    newCoordinates.push(newCoordinate)

  };

  newCoordinates.forEach((coordinate, i) => {
    lineFeature.geometry.coordinates.splice(i + 1,0,coordinate);
  });


  // // get point at 50% of line length
  // const midPoint = along(lineFeature, length / 2)
  // console.log(midPoint)
  // const newVertex = destination(midPoint.geometry.coordinates, length / 10, lineBearing - 90).geometry.coordinates;
  // console.log(newVertex)

  // push new coordinate to lineFeature
  return lineFeature;
}

const buildDimensionLayers = (lineFeature, id) => {
  // TODO validate the linefeature to make sure it has only two vertices,
  // and has a label property

  const lineLayer = {
    id: `${id}-dimension-line`,
    type: 'line',
    source: {
      type: 'geojson',
      data: getCurve(lineFeature),
    },
  };

  // const labelLayer = {
  //   id: `${id}-dimension-line-label`,
  //   type: 'symbol',
  //   source: {
  //     type: 'geojson',
  //     data: lineFeature,
  //   },
  //   layout: {
  //     "text-field": "{label}",
  //     "symbol-placement": "line-center",
  //     "text-offset": [
  //       0,
  //       -0.75
  //     ],
  //     "text-justify": "center",
  //     "text-anchor": "center",
  //     'text-size': 12
  //   }
  // };

  const arrowLayers = getArrowLayers(lineFeature, id);

  return [
    lineLayer,
    // labelLayer,
    ...arrowLayers
  ];
}
