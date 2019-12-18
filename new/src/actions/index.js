import { TLE_SOURCE_URL } from "../consts";
import { format as formatTime } from "date-fns";

export const REQUEST_GEOLOCATION = "REQUEST_GEOLOCATION";
export const RECEIVE_GEOLOCATION = "RECEIVE_GEOLOCATION";
export const FAILED_GEOLOCATION = "FAILED_GEOLOCATION";
export const INVALIDATE_GEOLOCATION = "INVALIDATE_GEOLOCATION";

export const UPDATE_VIEW = "UPDATE_VIEW";
export const UPDATE_SELECTED_SATELLITES = "UPDATE_SELECTED_SATELLITES";

export const REQUEST_TLES = "REQUEST_TLES";
export const RECEIVE_TLES = "RECEIVE_TLES";
export const FAILED_TLES = "FAILED_TLES";
export const INVALIDATE_TLES = "INVALIDATE_TLES";

export const requestGeolocation = () => ({
	type: REQUEST_GEOLOCATION
});

export const receiveGeolocation = position => ({
	type: RECEIVE_GEOLOCATION,
	position
});

export const failedGeolocation = error => ({
	type: FAILED_GEOLOCATION,
	error
});

export const invalidateGeolocation = () => ({
	type: INVALIDATE_GEOLOCATION
});

export function fetchGeolocation() {
	return function(dispatch) {
		dispatch(requestGeolocation());

		if (!navigator.geolocation) {
			dispatch(failedGeolocation({ message: "Geolocation not supported." }));
		}

		navigator.geolocation.getCurrentPosition(
			position => dispatch(receiveGeolocation(position)),
			error => dispatch(failedGeolocation(error))
		);
	};
}


export const requestTLEs = () => ({
	type: REQUEST_TLES
});

export const receiveTLEs = tles => ({
	type: RECEIVE_TLES,
	tles
});

export const failedTLEs = error => ({
	type: FAILED_TLES,
	error
});

export const invalidateTLEs = () => ({
	type: INVALIDATE_TLES
});

export const setSelectedSatellites = (noradIDs) => ({
	type: UPDATE_SELECTED_SATELLITES,
	noradIDs
});

export function fetchAllTLEs({ selectedSatellites } = {}) {
	return async function(dispatch) {
		dispatch(requestTLEs());

		// URL with some cachebusting based on the day, since TLEs are updated daily.
		const tleURL = `${ TLE_SOURCE_URL }?date=${ formatTime(new Date(), "yyyyMMdd") }`;

		let tles;
		try {
			tles = await fetch(tleURL);
			const rawTLEs = await tles.text();

			dispatch(receiveTLEs(rawTLEs));
			if (selectedSatellites && selectedSatellites.length > 0) {
				dispatch(setSelectedSatellites(selectedSatellites));
			}
		} catch(e) {
			dispatch(failedTLEs(e));
		}
	};
}


