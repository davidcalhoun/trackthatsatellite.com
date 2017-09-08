import { REDUX_ACTIONS } from '../config';

const initialState = {
  tles: []
};

export default function satellites(state = initialState, action) {
  const stateCopy = Object.assign({}, state);

  switch (action.type) {
    case REDUX_ACTIONS.SATELLITES_SET:
      if (!action.val) {
        console.warn('SATELLITES_SET: no satellites passed in');
        return stateCopy;
      }
      stateCopy.tles = action.val;
      stateCopy.names = action.val.map(tle => {
        const name = tle[0];
        const catalogID = tle[1].substr(2, 5);
        return `${name} (${catalogID})`
      });
      return stateCopy;

    default:
      return stateCopy;
  }
}
