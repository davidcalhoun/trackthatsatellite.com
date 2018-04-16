import find from 'ramda/src/find';

import { REDUX_ACTIONS } from '../config';

const initialState = {
  tle: [],
  name: '',
  lonLat: [],
  bearing: {
    degrees: 0,
    compass: ''
  },
  lookAngles: {}
};

function getMatchingTLE(str, satellites) {
  return find(sat => {
    if (!sat || sat.length < 3) return false;

    const name = sat[0].trim();
    const catalogID = sat[1].substr(2, 5);
    return str === `${name} (${catalogID})`;
  })(satellites);
}

export default function satellite(state = initialState, action) {
  const stateCopy = Object.assign({}, state);

  switch (action.type) {
    case REDUX_ACTIONS.SATELLITE_SET_BEARING:
      stateCopy.bearing = action.val;
      return stateCopy;

    case REDUX_ACTIONS.SATELLITE_SET_LON_LAT:
      stateCopy.lonLat = action.val;
      return stateCopy;

    case REDUX_ACTIONS.SATELLITE_SET_LOOK_ANGLES:
      stateCopy.lookAngles = action.val;
      return stateCopy;

    case REDUX_ACTIONS.SATELLITE_SET_TLE:
      stateCopy.name = action.nameAndCatalogID;
      stateCopy.tle = getMatchingTLE(action.nameAndCatalogID, action.satellites);

      return stateCopy;

    default:
      return stateCopy;
  }
}
