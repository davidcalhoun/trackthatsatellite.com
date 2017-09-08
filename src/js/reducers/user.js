import { REDUX_ACTIONS } from '../config';

const initialState = {
  lonLat: [],
  didDenyGeolocation: false,
  timestampOverride: false,
  timeSliderVal: 0
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

    case REDUX_ACTIONS.USER_SET_TIME:
      const now = Date.now();
      const MS_IN_ONE_DAY = 1000 * 60 * 60 * 24;
      const maxTimeFromNow = MS_IN_ONE_DAY * 2;
      const sliderVal = action.val;
      const shouldResetToCurrentTime = sliderVal === 0;
      let timeOverride;
      if (shouldResetToCurrentTime) {
        stateCopy.timestampOverride = false;
      } else {
        stateCopy.timestampOverride = now + maxTimeFromNow * (sliderVal * 0.002);
      }
      stateCopy.timeSliderVal = sliderVal;
      return stateCopy;

    case REDUX_ACTIONS.USER_SET_TIME_MS:
      stateCopy.timestampOverride = action.val;
      return stateCopy;

    default:
      return stateCopy;
  }
}
