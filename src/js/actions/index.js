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
