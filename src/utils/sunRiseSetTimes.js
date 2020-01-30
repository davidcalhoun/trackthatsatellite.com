/**
 * Based on https://github.com/Triggertrap/sun-js
 */

export const sunrise = function(timestampMS, latitude, longitude, zenith) {
	return sunriseSet(timestampMS, latitude, longitude, true, zenith);
};

export const sunset = function(timestampMS, latitude, longitude, zenith) {
	return sunriseSet(timestampMS, latitude, longitude, false, zenith);
};

const areTimesNearby = function(ts1, ts2, maxDiffMS = 60000) {
	return Math.abs(ts1 - ts2) < maxDiffMS;
};

export const isInSunlight = (timestampMS, [lng, lat]) => {
	const sunriseTime = sunrise(timestampMS, lat, lng);
	const sunsetTime = sunset(timestampMS, lat, lng);

//console.log(88, lat, lng, sunriseTime, sunsetTime, new Date(timestampMS))

	if (sunriseTime === null || sunsetTime === null) {
		// long winter/summer
		return null;
	}

	if (sunsetTime < sunriseTime) {
		//return timestampMS > sunriseTime;
		//return null;
		//console.log(88, lat, lng, sunriseTime, sunsetTime, new Date(timestampMS))
		return timestampMS < sunsetTime || timestampMS > sunriseTime;
	} else {
		return timestampMS > sunriseTime && timestampMS < sunsetTime;
	}
// 
// 	return timestampMS > sunriseTime && timestampMS < sunsetTime;
};

export const extendsOverTerminator = (timestampMS, coords1, coords2) => {
	const coords1IsInSunlight = isInSunlight(timestampMS, coords1);
	const coords2IsInSunlight = isInSunlight(timestampMS, coords2);

	//console.log(555, coords1IsInSunlight, coords2IsInSunlight)

	if (coords1IsInSunlight === null && coords2IsInSunlight === null) {
		return null;
	}

	if (coords1IsInSunlight === null && typeof coords2IsInSunlight === 'boolean') {
		return !coords2IsInSunlight;
	}

	if (coords2IsInSunlight === null && typeof coords1IsInSunlight === 'boolean') {
		return !coords1IsInSunlight;
	}

	return (
		(coords1IsInSunlight && !coords2IsInSunlight) ||
		(coords2IsInSunlight && !coords1IsInSunlight)
	);
};

const getTerminatorForLng = (timestampMS, lng) => {
	let tries = 1;
	let curLat = -90;
	let step = 5;
	while (curLat < 90) {
		const crossesTerminator = extendsOverTerminator(timestampMS, [lng, curLat], [lng, curLat + step]);

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
					extendsOverTerminator(
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

		if (lngLat && (lngLat[1] < -50 || lngLat[1] > 50)) {
			// extreme lats require greater precision due to map distortion
			curLng += 0.5;
		} else {
			curLng += 2;
		}
	}

	return coords;
};

const sunriseSet = function(timestampMS, latitude, longitude, sunrise, zenith) {
	if (!zenith) {
		zenith = 90.8333;
	}

	var hoursFromMeridian = longitude / DEGREES_PER_HOUR,
		dayOfYear = getDayOfYear(timestampMS),
		approxTimeOfEventInDays,
		sunMeanAnomaly,
		sunTrueLongitude,
		ascension,
		rightAscension,
		lQuadrant,
		raQuadrant,
		sinDec,
		cosDec,
		localHourAngle,
		localHour,
		localMeanTime,
		time;

	if (sunrise) {
		approxTimeOfEventInDays = dayOfYear + (6 - hoursFromMeridian) / 24;
	} else {
		approxTimeOfEventInDays = dayOfYear + (18.0 - hoursFromMeridian) / 24;
	}

	sunMeanAnomaly = 0.9856 * approxTimeOfEventInDays - 3.289;

	sunTrueLongitude =
		sunMeanAnomaly +
		1.916 * sinDeg(sunMeanAnomaly) +
		0.02 * sinDeg(2 * sunMeanAnomaly) +
		282.634;
	sunTrueLongitude = mod(sunTrueLongitude, 360);

	ascension = 0.91764 * tanDeg(sunTrueLongitude);
	rightAscension = (360 / (2 * Math.PI)) * Math.atan(ascension);
	rightAscension = mod(rightAscension, 360);

	lQuadrant = Math.floor(sunTrueLongitude / 90) * 90;
	raQuadrant = Math.floor(rightAscension / 90) * 90;
	rightAscension = rightAscension + (lQuadrant - raQuadrant);
	rightAscension /= DEGREES_PER_HOUR;

	sinDec = 0.39782 * sinDeg(sunTrueLongitude);
	cosDec = cosDeg(asinDeg(sinDec));
	const cosLocalHourAngle =
		(cosDeg(zenith) - sinDec * sinDeg(latitude)) /
		(cosDec * cosDeg(latitude));

	if (cosLocalHourAngle < -1 || cosLocalHourAngle > 1) {
		// no sunrise/sunset (long winter or summer)
		return null;
	}

	localHourAngle = acosDeg(cosLocalHourAngle);

	if (sunrise) {
		localHourAngle = 360 - localHourAngle;
	}

	localHour = localHourAngle / DEGREES_PER_HOUR;

	localMeanTime =
		localHour + rightAscension - 0.06571 * approxTimeOfEventInDays - 6.622;

	time = localMeanTime - longitude / DEGREES_PER_HOUR;
	time = mod(time, 24);

	const timeObj = new Date(timestampMS);
	let midnight = new Date(0);
	midnight.setUTCFullYear(timeObj.getUTCFullYear());
	midnight.setUTCMonth(timeObj.getUTCMonth());
	midnight.setUTCDate(timeObj.getUTCDate());

	var milli = midnight.getTime() + (time * 60 * 60 * 1000);

	return new Date(milli);
};

const DEGREES_PER_HOUR = 360 / 24;

// Utility functions

const getDayOfYear = function(timestampMS) {
	const time = new Date(timestampMS);
	var onejan = new Date(time.getFullYear(), 0, 1);
	const output = Math.ceil((time - onejan) / 86400000);
	return output;
};

const degToRad = function(num) {
	return num * Math.PI / 180;
};

const radToDeg = function(radians) {
	return radians * 180.0 / Math.PI;
};

const sinDeg = function(deg) {
	return Math.sin(deg * 2.0 * Math.PI / 360.0);
};

const acosDeg = function(x) {
	if (x > 1 || x < -1) {
		throw new Error(`x must be between -1 and 1, but received ${x}.`);
	}
	return Math.acos(x) * 360.0 / (2 * Math.PI);
};

const asinDeg = function(x) {
	return Math.asin(x) * 360.0 / (2 * Math.PI);
};

const tanDeg = function(deg) {
	return Math.tan(deg * 2.0 * Math.PI / 360.0);
};

const cosDeg = function(deg) {
	return Math.cos(deg * 2.0 * Math.PI / 360.0);
};

const mod = function(a, b) {
	var result = a % b;
	if (result < 0) {
		result += b;
	}
	return result;
};

