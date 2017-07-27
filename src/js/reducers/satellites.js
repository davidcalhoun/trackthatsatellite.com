const initialState = {
  tles: []
};

export default function satellites(state = initialState, action) {
  const stateCopy = Object.assign({}, state);

  switch (action.type) {
    case 'SATELLITES_SET':
      stateCopy.tles = action.val;
      return stateCopy;

    default:
      return stateCopy;
  }
}
