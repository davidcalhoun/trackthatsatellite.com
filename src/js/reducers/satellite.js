import { REDUX_ACTIONS } from '../config';

const initialState = {
  lonLat: [],
  bearing: {
    degrees: 0,
    compass: ''
  }
};

export default function satellite(state = initialState, action) {
  const stateCopy = Object.assign({}, state);

  switch (action.type) {
    case REDUX_ACTIONS.SATELLITE_SET_LON_LAT:
      stateCopy.lonLat = action.val;
      return stateCopy;

    case REDUX_ACTIONS.SATELLITE_SET_BEARING:
      stateCopy.bearing = action.val;
      return stateCopy;

    default:
      return stateCopy;
  }
}
