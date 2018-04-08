/*
  Used Map
*/


var MAP = {

  map : new mapboxgl.Map({
    style: 'mapbox://styles/mapbox/streets-v9',
    center: {lng: 2.199642497402465, lat: 41.39925533025465},
    zoom: 15.5,
    pitch: 45,
    bearing: -17.6,
    hash: true,
    container: 'map'
  }),

  geolocateControl : new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
  }),

  userPosition : null,

  init : function(){
    /*
    Se ha sobreescrito la funcion de la API de mapBox de geolocateControl,
    Se ha cambiado por 'Map.geolocateControl' donde antes había 'this'
    Se ha añadido un par lineas (al final) donde se obtiene la posicion monitorizada
    */
    MAP.geolocateControl._onSuccess = function(position) {
      if (MAP.geolocateControl.options.trackUserLocation) {
        // keep a record of the position so that if the state is BACKGROUND and the user
        // clicks the button, we can move to ACTIVE_LOCK immediately without waiting for
        // watchPosition to trigger _onSuccess
        MAP.geolocateControl._lastKnownPosition = position;

        switch (MAP.geolocateControl._watchState) {
          case 'WAITING_ACTIVE':
          case 'ACTIVE_LOCK':
          case 'ACTIVE_ERROR':
          MAP.geolocateControl._watchState = 'ACTIVE_LOCK';
          MAP.geolocateControl._geolocateButton.classList.remove('mapboxgl-ctrl-geolocate-waiting');
          MAP.geolocateControl._geolocateButton.classList.remove('mapboxgl-ctrl-geolocate-active-error');
          MAP.geolocateControl._geolocateButton.classList.add('mapboxgl-ctrl-geolocate-active');
          break;
          case 'BACKGROUND':
          case 'BACKGROUND_ERROR':
          MAP.geolocateControl._watchState = 'BACKGROUND';
          MAP.geolocateControl._geolocateButton.classList.remove('mapboxgl-ctrl-geolocate-waiting');
          MAP.geolocateControl._geolocateButton.classList.remove('mapboxgl-ctrl-geolocate-background-error');
          MAP.geolocateControl._geolocateButton.classList.add('mapboxgl-ctrl-geolocate-background');
          break;
          default:
          assert(false, `Unexpected watchState ${MAP.geolocateControl._watchState}`);
        }
      }

      // if showUserLocation and the watch state isn't off then update the marker location
      if (MAP.geolocateControl.options.showUserLocation && MAP.geolocateControl._watchState !== 'OFF') {
        MAP.geolocateControl._updateMarker(position);
      }

      // if in normal mode (not watch mode), or if in watch mode and the state is active watch
      // then update the camera
      if (!MAP.geolocateControl.options.trackUserLocation || MAP.geolocateControl._watchState === 'ACTIVE_LOCK') {
        MAP.geolocateControl._updateCamera(position);
      }

      if (MAP.geolocateControl.options.showUserLocation) {
        MAP.geolocateControl._dotElement.classList.remove('mapboxgl-user-location-dot-stale');
      }

      MAP.geolocateControl.fire('geolocate', position);
      MAP.geolocateControl._finish();

      //Robamos la posicion
      APP.on_gotPosition();

    }; // END of HACK chungo

    MAP.map.on('load', function() {
      // Insert the layer beneath any symbol layer.
      var layers = MAP.map.getStyle().layers;
      var labelLayerId;
      for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      MAP.map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#aaa',

          // use an 'interpolate' expression to add a smooth transition effect to the
          // buildings as the user zooms in
          'fill-extrusion-height': [
            "interpolate", ["linear"], ["zoom"],
            15, 0,
            15.05, ["get", "height"]
          ],
          'fill-extrusion-base': [
            "interpolate", ["linear"], ["zoom"],
            15, 0,
            15.05, ["get", "min_height"]
          ],
          'fill-extrusion-opacity': .6
        }
      }, labelLayerId);

 
      //Todo esop para añadir esto
      // IF fakeLocation show circle
      if(APP.debug.fakeLocation){
        MAP.map.addSource('point', {
          "type": "geojson",
          "data": {
            "type": "Point",
            "coordinates": [DATA._me.position.lng, DATA._me.position.lat],
          },
        });
        MAP.map.addLayer({
          "id": "point",
          "source": "point",
          "type": "circle",
          "paint": {
            "circle-radius": 10,
            "circle-color": "#007cbf"
          }
        });
      }

    });
    // Add geolocate control to the map.

    MAP.map.addControl(MAP.geolocateControl);
  }
}
