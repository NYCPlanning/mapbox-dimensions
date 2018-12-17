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

$('.draw').on('click', () => {
  draw = map.addControl(Draw, 'top-left');
  $('.draw').hide();
  $('.done').show();
});

map.on('draw.create', (e) => {
  console.log(e)

  const line = Draw.getAll().features[0];
  console.log(line);

  draw = map.removeControl(Draw);
  $('.draw').show();
  $('.done').hide();

  if (line) {
    const layers = buildDimensionLayers(line, line.id);

    layers.forEach(layer => {
      map.addLayer(layer);
    });
  }
});

const testLine = {
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



map.on('style.load', () => {
  map.loadImage('https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Black_Arrow_Up.svg/240px-Black_Arrow_Up.svg.png', function(error, image) {
    if (error) throw error;
       map.addImage('arrow', image);
       const layers = buildDimensionLayers(testLine, 'someId');

       layers.forEach(layer => {
         map.addLayer(layer);
       });
  });
});