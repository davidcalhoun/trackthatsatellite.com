import { combineReducers } from 'redux'
import {
  REQUEST_GEOLOCATION, RECEIVE_GEOLOCATION, FAILED_GEOLOCATION, INVALIDATE_GEOLOCATION,
  UPDATE_SELECTED_SATELLITES,
  REQUEST_TLES, RECEIVE_TLES, FAILED_TLES, INVALIDATE_TLES,
  UPDATE_VIEW
} from '../actions';
import { splitEvery } from "ramda";
import * as TLEJS from "tle.js";
const tlejs = new TLEJS();

/**
 * Converts raw TLE file into an array.
 */
export const splitRawTLEs = rawText => {
  const arr = rawText.split("\n");
  return splitEvery(3, arr);
};

/**
 * Converts raw TLEs into an easy lookup table based on NORAD satellite number.
 */
const rawTLEsToHash = rawText => {
  const arr = splitRawTLEs(rawText);

  return arr.reduce((satellites, satellite) => {
    const NORADSatNumber = tlejs.getSatelliteNumber(satellite);
    satellites[NORADSatNumber] = satellite;
    return satellites;
  }, {});
}

const mapSatsToTLEs = (satelliteIDs = [], tles = []) => {
  return satelliteIDs.map((id) => {
    // TODO: check for missing, error out?
    return tles[id];
  }, {});
}

const initialGeolocationState = {
  isFetching: false,
  didInvalidate: false,
  error: null,
  position: null
};
const geolocation = (state = initialGeolocationState, action) => {
  switch (action.type) {
    case INVALIDATE_GEOLOCATION:
      return {
        ...state,
        position: {},
        didInvalidate: true
      }
    case REQUEST_GEOLOCATION:
      return {
        ...state,
        isFetching: true,
        didInvalidate: false
      }
    case RECEIVE_GEOLOCATION:
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        position: action.position
      }
    case FAILED_GEOLOCATION:
      alert('Failed to fetch geolocation.');
      return {
        ...state,
        error: action.error,
        isFetching: false,
        didInvalidate: false
      }
    default:
      return state
  }
}

const initialTLEsState = {
  allRaw: "",
  all: {},
  error: null,
  selectedSatellites: []
};
const tles = (state = initialTLEsState, action) => {
  switch (action.type) {
    case INVALIDATE_TLES:
      return {
        ...state,
        all: {},
        allRaw: "",
        didInvalidate: true
      }
    case REQUEST_TLES:
      return {
        ...state,
        isFetching: true,
        didInvalidate: false
      }
    case RECEIVE_TLES:
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        allRaw: action.tles,
        all: rawTLEsToHash(action.tles)
      }
    case FAILED_TLES:
      return {
        ...state,
        error: action.error,
        isFetching: false,
        didInvalidate: false
      }
    case UPDATE_SELECTED_SATELLITES:
      return {
        ...state,
        selectedSatellites: mapSatsToTLEs(action.noradIDs, state.all)
      }
    default:
      return state
  }
}

const view = (state = {}, action) => {
	switch (action.type) {
		case UPDATE_VIEW:
			return {
				...state,
				currentView: action.view
			}
		default: 
			return state
	}
}

const rootReducer = combineReducers({
  geolocation,
  view,
  tles
})

export default rootReducer;
