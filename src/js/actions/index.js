import { REDUX_ACTIONS } from '../config';

export const setSatelliteLonLat = (val) => ({ type: REDUX_ACTIONS.SATELLITE_SET_LON_LAT, val });
export const setSatelliteBearing = (val) => ({ type: REDUX_ACTIONS.SATELLITE_SET_BEARING, val });
export const setSatellites = (val) => ({ type: REDUX_ACTIONS.SATELLITES_SET, val });

export const setUserLonLat = (val) => ({ type: REDUX_ACTIONS.USER_SET_LON_LAT, val });
export const setUserDeniedGeolocation = (val) => ({ type: REDUX_ACTIONS.USER_DENIED_GEOLOCATION, val });
