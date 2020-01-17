import { format as formatTime } from "date-fns";
import { sortBy, prop } from "ramda";
import * as TLEJS from "tle.js";
const tlejs = new TLEJS();

export { default as useSatellitePosition } from './useSatellitePosition';
export { default as useWindowResize } from './useWindowResize';
export * from './sunRiseSetTimes';

export const getNORADSatNum = satetelliteNameInURL => {
  const pieces = satetelliteNameInURL.split("-");
  return pieces[pieces.length - 1];
}

export const latLngForDisplay = ([lon, lat] = []) => {
	if (!lat || !lon) return "";
	return `${ lat.toFixed(2) }, ${ lon.toFixed(2) }`;
}

const toFullYear = twoDigitYear => {
	const date = new Date(`January 1, ${ twoDigitYear }`);
	return date.getFullYear();
}

const getSatelliteNameVariants = tle => {
	const name = tlejs.getSatelliteName(tle);
	const noradID = tlejs.getSatelliteNumber(tle);
	const yearTwoDigit = tlejs.getIntDesignatorYear(tle);
	const launchNumber = tlejs.getIntDesignatorLaunchNumber(tle);
	const pieceOfLaunch = tlejs.getIntDesignatorPieceOfLaunch(tle);

	const cosparID = `${ toFullYear(yearTwoDigit) }-${ launchNumber }${ pieceOfLaunch }`;

	return {
		name: name.trim(),
		noradID,
		cosparID
	}
}

export const getSatelliteDisplayName = tle => {
	const { name, noradID, cosparID } = getSatelliteNameVariants(tle);

	return `${ name.trim() } (${noradID}, ${cosparID})`;
}

export const tlesToAutocompleteOptions = (tles = {}) => {
	if (Object.keys(tles).length === 0) {
		return [];
	}

	const tleArr = Object.entries(tles).map(([noradID, tle]) => {
		const { name, cosparID } = getSatelliteNameVariants(tle);
		
		return {
			title: name,
			noradID,
			cosparID
		}
	});


	const sortByName = sortBy(prop("title"));
	const tleArrSorted = sortByName(tleArr);

	return tleArrSorted;
}

const toURLFriendlySatName = nameStr => {
	return nameStr.replace(/\(|\)/g, "").replace(/\s/g, "-").toLowerCase();
}

export const satsToURLString = tles => {
	return tles.reduce((accum, tle) => {
		const nameLine = tle[0].trim();
		const name = toURLFriendlySatName(nameLine);
		const noradID = tlejs.getSatelliteNumber(tle);
		return accum.concat(`${ name }-${ noradID }`);
	}, "");
}

