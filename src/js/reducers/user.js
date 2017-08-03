import { REDUX_ACTIONS } from '../config';

const initialState = {
  lonLat: [],
  didDenyGeolocation: false
};

export default function user(state = initialState, action) {
  const stateCopy = Object.assign({}, state);

  switch (action.type) {
    case REDUX_ACTIONS.USER_SET_LON_LAT:
      stateCopy.lonLat = action.val;
      return stateCopy;

    case REDUX_ACTIONS.USER_DENIED_GEOLOCATION:
      stateCopy.didDenyGeolocation = true;
      return stateCopy;

    default:
      return stateCopy;
  }
}
