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

// TODO: cache lastLat, speed up
export const getSunlightTerminatorCoords = function(timestampMS = Date.now()) {
	let coords = [];

	let curLng = -180;
	while (curLng < 181) {
		let isDone = false;
		let curLat = -90;
		while (!isDone) {
			const sunriseTimeMS = sunrise(timestampMS, curLat, curLng);
			const sunsetTimeMS = sunset(timestampMS, curLat, curLng);
			const isNearSunriseTerminator = areTimesNearby(sunriseTimeMS, timestampMS);
			const isNearSunsetTerminator = areTimesNearby(sunsetTimeMS, timestampMS);
			if (isNearSunriseTerminator || isNearSunsetTerminator) {
				coords.push([curLng, curLat]);
				isDone = true;
			}

			if(curLat >= 90) {
				// not found - pole in permanent summer or winter
				isDone = true;
			}

			curLat += 0.5;
		}
		curLng += 0.5;
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

	var milli = midnight.getTime() + time * 60 * 60 * 1000;

	return new Date(milli);
};

const DEGREES_PER_HOUR = 360 / 24;

// Utility functions

const getDayOfYear = function(timestampMS) {
	const time = new Date(timestampMS);
	var onejan = new Date(time.getFullYear(), 0, 1);
	return Math.ceil((time - onejan) / 86400000);
};

const degToRad = function(num) {
	return (num * Math.PI) / 180;
};

const radToDeg = function(radians) {
	return (radians * 180.0) / Math.PI;
};

const sinDeg = function(deg) {
	return Math.sin((deg * 2.0 * Math.PI) / 360.0);
};

const acosDeg = function(x) {
	return (Math.acos(x) * 360.0) / (2 * Math.PI);
};

const asinDeg = function(x) {
	return (Math.asin(x) * 360.0) / (2 * Math.PI);
};

const tanDeg = function(deg) {
	return Math.tan((deg * 2.0 * Math.PI) / 360.0);
};

const cosDeg = function(deg) {
	return Math.cos((deg * 2.0 * Math.PI) / 360.0);
};

const mod = function(a, b) {
	var result = a % b;
	if (result < 0) {
		result += b;
	}
	return result;
};
