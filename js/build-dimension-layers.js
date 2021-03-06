// this function takes a geojson LineString Feature
// and returns the mapboxGL layers necessary to display the various components
// the layers all carry their own sources, so no need to add sources separately beforehand

const getArrowLayers = (lineFeature, id, annotationType) => {
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
    id: `${id}-annotation-startarrow-symbol`,
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
    id: `${id}-annotation-endarrow-symbol`,
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
          rotation: annotationType === 'linear' ? lineBearing : lineBearing + 50 ,
        }
      }
    },
    layout,
  };

  return [ startArrowLayer, endArrowLayer ];
}

const getCurve = (lineFeature) => {
  // takes a GeoJson LineString Feature with two vertices, interpolates an arc between them
  // returns a new GeoJson LineString for the arc

  const { coordinates } = lineFeature.geometry;
  const lineBearing = bearing(coordinates[0], coordinates[1]); // get bearing of original line
  const lineLength = length(lineFeature) // get length of original line

  const factor = 2; // factor determines the concavity of the arc
  const chunks = 20; // number of segments the new arc LineString should have
  const chunkLength = lineLength / chunks; // the geographic length of each chunk

  // here we interpolate points along the original line, and then offset each at a 90 degree angle off the original line
  // the distance to offset depends on distance from the center (the center-most point will be the apex of the arc)
  //

  const center = along(lineFeature, lineLength / 2).geometry.coordinates; // get coordinates for the center of the original line
  const newCoordinates = []; // empty array to push the offset coordinates to

  for (let i = 1; i < (chunks); i++) {
    // calculate the position of a new vertex along the original line
    const originalCoordinate = along(lineFeature, (i * chunkLength) ).geometry.coordinates

    // get the geographic distance from the center, this will be used to determine the offset
    const distanceFromCenter = distance(originalCoordinate, center)

    // calculate the offset distance
    // (x^2 + .25l^2) / -fl
    const offsetDistance = ((distanceFromCenter * distanceFromCenter) - (.25 * lineLength * lineLength)) / -(factor * lineLength)


    // calculate the bearing
    const offsetBearing = lineBearing - 90;

    // caclulate the offset vertex location
    const newCoordinate = destination(originalCoordinate, offsetDistance, offsetBearing).geometry.coordinates;
    newCoordinates.push(newCoordinate);
  };

  // push all of the new coordinates into the original two-vertex line
  newCoordinates.forEach((coordinate, i) => {
    lineFeature.geometry.coordinates.splice(i + 1,0,coordinate);
  });

  return lineFeature;
}

const buildDimensionLayers = (lineFeature, annotationType) => {
  // takes a GeoJson LineString Feature with two vertices, and annotationType ('linear' or 'curved')

  // TODO validate the linefeature to make sure it has only two vertices,
  // and has a label property
  const { id } = lineFeature;

  // generate the line layer
  const lineLayer = {
    id: `${id}-annotation-line`,
    type: 'line',
    source: {
      type: 'geojson',
      data: annotationType === 'linear' ? lineFeature : getCurve(lineFeature),
    },
  };

  // generate the label layer
  const labelLayer = {
    id: `${id}-annotation-line-label`,
    type: 'symbol',
    source: {
      type: 'geojson',
      data: lineFeature,
    },
    layout: {
      "text-field": "{label}",
      "symbol-placement": "line-center",
      "text-offset": [
        0,
        -0.75
      ],
      "text-justify": "center",
      "text-anchor": "center",
      'text-size': 12
    }
  };

  // generate the arrow symbol layers
  const arrowLayers = getArrowLayers(lineFeature, id, annotationType);

  // return an array of all of the layers
  return [
    lineLayer,
    labelLayer,
    ...arrowLayers
  ];
}
