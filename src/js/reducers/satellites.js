import R from 'ramda';
import map from 'ramda/src/map';
import sort from 'ramda/src/sort';
import comparator from 'ramda/src/comparator';
import reject from 'ramda/src/reject';
import pipe from 'ramda/src/pipe';
import lt from 'ramda/src/lt';

import { REDUX_ACTIONS } from '../config';

const initialState = {
  tles: []
};

const tlesToStrs = (arr) => map(tleToNameAndCatalogIDStr, arr);

const tleToNameAndCatalogIDStr = (tleArr) => {
  const name = tleArr[0].trim();
  const catalogID = tleArr[1].substr(2, 5);
  return `${name} (${catalogID})`;
}

const alphabetize = arr => sort(comparator(lt), arr);

const filterEmptyVals = arr => reject((o) => !o || o.length < 3, arr);

const filterDupeVals = arr => {
  // Convert to Set, which has unique keys.
  const set = new Set(arr);

  // Convert back to array.
  return [...set];
};

const tleToNamesPipe = pipe(filterEmptyVals, tlesToStrs, filterDupeVals, alphabetize);

const tleToNames = arr => tleToNamesPipe(arr);

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

      return stateCopy;

    default:
      return stateCopy;
  }
}
