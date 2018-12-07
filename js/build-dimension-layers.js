// this function takes a geojson LineString Feature
// and returns the features necessary to display the various components

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
          coordinates: lineFeature.geometry.coordinates[1]
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


const buildDimensionLayers = (lineFeature, id) => {
  // TODO validate the linefeature to make sure it has only two vertices,
  // and has a label property

  const lineLayer = {
    id: `${id}-dimension-line`,
    type: 'line',
    source: {
      type: 'geojson',
      data: lineFeature,
    },
  };

  const labelLayer = {
    id: `${id}-dimension-line-label`,
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

  const arrowLayers = getArrowLayers(lineFeature, id);

  return [ lineLayer, labelLayer, ...arrowLayers, ];
}
