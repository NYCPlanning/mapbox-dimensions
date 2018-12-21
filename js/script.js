const map = new mapboxgl.Map({
    container: 'map', // container id
    style: '//raw.githubusercontent.com/NYCPlanning/labs-gl-style/master/data/style.json', //hosted style id
    center: [-73.98, 40.750768],
    zoom: 16,
    hash: true,
    fadeDuration: 50,
});


const Draw = new MapboxDraw({
  controls: {
    point: false,
    polygon: false,
    trash: false,
    combine_features: false,
    uncombine_features: false,
  },
  defaultMode: 'draw_annotation',
  styles: drawStyles,
  modes: Object.assign({
    draw_annotation: AnnotationMode,
  }, MapboxDraw.modes)
});

let drawMode = '';
$('.draw-linear').on('click', () => {
  draw = map.addControl(Draw, 'top-left');
  drawMode = 'linear';
});

$('.draw-curved').on('click', () => {
  draw = map.addControl(Draw, 'top-left');
  drawMode = 'curved';
});

map.on('draw.create', (e) => {

  const line = Draw.getAll().features[0];

  draw = map.removeControl(Draw);

  if (line) {
    const layers = buildDimensionLayers(line, drawMode);

    layers.forEach(layer => {
      map.addLayer(layer);
    });
  }
});

const testLine1 = {
    "id": "foo",
    "type": "Feature",
    "properties": {
      label: '375 ft',
    },
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [
          -73.98039400577545,
          40.75119085932802
        ],
        [
          -73.97872567176819,
          40.75209302179819
        ]
      ]
    }
  }

const testLine2 = {
  "id": "bar",
  "type": "Feature",
  "properties": {
    label: '200 ft',
  },
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [
        -73.97778689861296,
        40.75048781432228
      ],
      [
        -73.97728264331818,
        40.75110145517336
      ]
    ]
  }
}



map.on('style.load', () => {
  map.loadImage('https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Black_Arrow_Up.svg/240px-Black_Arrow_Up.svg.png', function(error, image) {
    if (error) throw error;
       map.addImage('arrow', image);
       const layers1 = buildDimensionLayers(testLine1, 'curved');
       const layers2 = buildDimensionLayers(testLine2, 'linear');

       layers1.forEach(layer => {map.addLayer(layer);});
       layers2.forEach(layer => {map.addLayer(layer);});

  });
});
