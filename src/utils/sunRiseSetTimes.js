/**
 * Based on https://github.com/Triggertrap/sun-js
 */

import SunCalc from 'suncalc';

const INVALID_DATE = 'Invalid Date';

export const getDaylightHours = (timeMS, [lng, lat]) => {
	const times = SunCalc.getTimes(new Date(timeMS), lat, lng);
console.log(888, times)
	return (times.dusk - times.dawn) / (1000 * 60 * 60);
}

export const isInSunlight = (timeMS, [lng, lat]) => {
	const times = SunCalc.getTimes(new Date(timeMS), lat, lng);

	// Handle polar summer/winter.
	if (times.sunrise.toString() === INVALID_DATE || times.sunset.toString() === INVALID_DATE) {
		return null;
	}

	return times.sunrise < timeMS && timeMS < times.sunset;
}

export const extendsOverTerminator = (timestampMS, coords1, coords2) => {
	const coords1IsInSunlight = isInSunlight(timestampMS, coords1);
	const coords2IsInSunlight = isInSunlight(timestampMS, coords2);

	if (coords1IsInSunlight === null || coords2IsInSunlight === null) {
		return null;
	}

	return (
		(coords1IsInSunlight && !coords2IsInSunlight) ||
		(coords2IsInSunlight && !coords1IsInSunlight)
	);
};

const areTimesNearby = function(ts1, ts2, maxDiffMS = 60000) {
	return Math.abs(ts1 - ts2) < maxDiffMS;
};


const getTerminatorForLng = (timestampMS, lng, checkFn = extendsOverTerminator) => {
	let tries = 1;
	let curLat = -90;
	let step = 5;
	while (curLat < 90) {
		const crossesTerminator = checkFn(timestampMS, [lng, curLat], [lng, curLat + step]);

		if (crossesTerminator) {
			// Smooth out curves on extreme lats.
			const stepGoal = (curLat > -50 && curLat < 50) ? 1 : 0.03;

			if (step <= stepGoal) {
				// precise enough, so finish up
				//console.log(111, `${curLat}, ${lng}; ${curLat + step}, ${lng}`, curLat + step, isInSunlight(timestampMS, [lng, curLat]), isInSunlight(timestampMS, [lng, curLat + step]));
				if (crossesTerminator !== null) {
					return [lng, curLat];
				} else {
					return null;
				}
				
			} else {
				// passed terminator, figure out which half of area contains terminator
				// (binary search)

				if (
					checkFn(
						timestampMS,
						[lng, curLat],
						[lng, curLat + (step / 2)]
					)
				) {
					// first half (south)
				} else {
					// second half (north)
					// advance
					curLat = curLat + (step / 2);
				}

				step /= 2;
			}
		} else {
			if (crossesTerminator !== null) {
				curLat += step;
			} else {
				//console.log(111, 'null result')
				//console.log('slow stepping...', curLat, lng);
				curLat += step;
			}
		}

		if (curLat > 80) {
			//console.log(111, 'oops?', curLat, lng)
		}

		tries++;
	}
};

export const getSunlightTerminatorCoords = function(timestampMS = Date.now()) {
	let coords = [];

	let curLng = -180;
	while (curLng < 180) {
		// Drawing from the antemeridian eastward.
		const lngLat = getTerminatorForLng(timestampMS, curLng);

		if (lngLat) {
			coords.push(lngLat);
		}

		// extreme lats require greater precision due to map distortion
		const isInExtremeLat = lngLat && (lngLat[1] < -50 || lngLat[1] > 50);
		const step = (isInExtremeLat) ? 0.5 : 2;

		curLng += step;
	}

	const isNorthPoleInWinter = isInSunlight(timestampMS, [0, 90]) === null && getDaylightHours(timestampMS, [1, 70]) < 12;

	const startingLat = isNorthPoleInWinter ? 90 : -90;

	return [[
		[0, startingLat],
		[-180, startingLat],
		[-180, coords[0][1]],
		...coords,
		[180, coords[0][1]],
		[180, startingLat]
	]];
};


