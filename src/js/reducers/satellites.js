import R from 'ramda';

import { REDUX_ACTIONS } from '../config';

const initialState = {
  tles: []
};

const tlesToStrs = (arr) => R.map(tleToNameAndCatalogIDStr, arr);

const tleToNameAndCatalogIDStr = (tleArr) => {
  const name = tleArr[0].trim();
  const catalogID = tleArr[1].substr(2, 5);
  return `${name} (${catalogID})`;
}

const alphabetize = (arr) => R.sort(R.comparator(R.lt), arr);

const filterEmptyVals = (arr) => R.reject((o) => o.length < 3, arr);

const tleToNamesPipe = R.pipe(filterEmptyVals, tlesToStrs, alphabetize);

const tleToNames = (arr) => tleToNamesPipe(arr);

export default function satellites(state = initialState, action) {
  const stateCopy = Object.assign({}, state);

  switch (action.type) {
    case REDUX_ACTIONS.SATELLITES_SET:
      if (!action.val) {
        console.warn('SATELLITES_SET: no satellites passed in');
        return stateCopy;
      }

      stateCopy.tles = action.val;
      stateCopy.names = tleToNames(action.val);

      console.log(stateCopy.names)

      return stateCopy;

    default:
      return stateCopy;
  }
}
