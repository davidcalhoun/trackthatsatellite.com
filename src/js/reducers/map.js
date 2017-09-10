import { MAPBOX_ACCESS_TOKEN, REDUX_ACTIONS } from '../config';

window.mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const initialState = {
  mapInstance: null,
  onStyleLoaded: null,
  onStyleUnloaded: null,
  is3dView: false,
  isSatelliteView: false,
  style: 'mapbox://styles/mapbox/outdoors-v10'
};

export default function map(state = initialState, action) {
  const stateCopy = Object.assign({}, state);

  switch (action.type) {
    case REDUX_ACTIONS.MAP_INIT:
      stateCopy.mapInstance = new mapboxgl.Map({
        container: action.val.container,
        style: stateCopy.style,
      });

      stateCopy.onStyleLoaded = action.val.onStyleLoaded;
      if (stateCopy.onStyleLoaded) {
        stateCopy.mapInstance.on('style.load', (...args) => {
          stateCopy.onStyleLoaded(...args);
        });
      }

      stateCopy.onStyleUnloaded = action.val.onStyleUnloaded;

      // Zoom/compass controls.
      stateCopy.mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-left');

      return stateCopy;

    case REDUX_ACTIONS.MAP_DESTROY:
      stateCopy.mapInstance = null;
      return stateCopy;

    case REDUX_ACTIONS.MAP_TOGGLE_3D_VIEW:
      const satellite = action.val;
      stateCopy.is3dView = !stateCopy.is3dView;

      if (stateCopy.is3dView) {
        // 3D View
        stateCopy.mapInstance.setZoom(3);
        stateCopy.mapInstance.setPitch(60);
        stateCopy.mapInstance.setBearing(satellite.bearing.degrees.toFixed(2));
        stateCopy.mapInstance.setCenter(satellite.lonLat);
      } else {
        // 2D View
        stateCopy.mapInstance.setZoom(0);
        stateCopy.mapInstance.setPitch(0);
        stateCopy.mapInstance.setBearing(0);
        stateCopy.mapInstance.setCenter([0,0]);
      }

      return stateCopy;

    case REDUX_ACTIONS.MAP_TOGGLE_SATELLITE_VIEW:
      stateCopy.isSatelliteView = !stateCopy.isSatelliteView;

      stateCopy.onStyleUnloaded && stateCopy.onStyleUnloaded();

      const layerId = (stateCopy.isSatelliteView) ? 'satellite' : 'outdoors';
      const style = `mapbox://styles/mapbox/${layerId}-v9`;

      // Need to re-init style loaded listener for the new styles.
      if (stateCopy.onStyleLoaded) {
        stateCopy.mapInstance.on('style.load', (...args) => {
          stateCopy.onStyleLoaded(...args);
        });
      }

      stateCopy.mapInstance.setStyle(style);

      return stateCopy;

    case REDUX_ACTIONS.MAP_SET_BEARING:
      stateCopy.mapInstance.setBearing(action.val);
      return stateCopy;

    case REDUX_ACTIONS.MAP_SET_STYLE:
      stateCopy.style = action.val;
      return stateCopy;

    default:
      return stateCopy;
  }
}
