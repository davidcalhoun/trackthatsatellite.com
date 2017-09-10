import { REDUX_ACTIONS } from '../config';

export const setSatelliteBearing = (val) => ({ type: REDUX_ACTIONS.SATELLITE_SET_BEARING, val });
export const setSatelliteLonLat = (val) => ({ type: REDUX_ACTIONS.SATELLITE_SET_LON_LAT, val });
export const setSatelliteTLE = (nameAndCatalogID, satellites) => ({
  type: REDUX_ACTIONS.SATELLITE_SET_TLE,
  nameAndCatalogID,
  satellites
});

export const setSatellites = (val) => ({ type: REDUX_ACTIONS.SATELLITES_SET, val });
export const setSatelliteLookAngles = (val) => ({ type: REDUX_ACTIONS.SATELLITE_SET_LOOK_ANGLES, val });

export const setUserLonLat = (val) => ({ type: REDUX_ACTIONS.USER_SET_LON_LAT, val });
export const setUserDeniedGeolocation = (val) => ({ type: REDUX_ACTIONS.USER_DENIED_GEOLOCATION, val });
export const setUserTime = (val) => ({ type: REDUX_ACTIONS.USER_SET_TIME, val });
export const setUserTimeMS = (val) => ({ type: REDUX_ACTIONS.USER_SET_TIME_MS, val });

export const mapDestroy = (val) => ({ type: REDUX_ACTIONS.MAP_DESTROY, val });
export const mapInit = (val) => ({ type: REDUX_ACTIONS.MAP_INIT, val });
export const setMapBearing = (val) => ({ type: REDUX_ACTIONS.MAP_SET_BEARING, val });
export const setMapStyle = (val) => ({ type: REDUX_ACTIONS.MAP_SET_STYLE, val });
export const toggleMap3DView = (val) => ({ type: REDUX_ACTIONS.MAP_TOGGLE_3D_VIEW, val });
export const toggleMapSatelliteView = (val) => ({ type: REDUX_ACTIONS.MAP_TOGGLE_SATELLITE_VIEW, val });