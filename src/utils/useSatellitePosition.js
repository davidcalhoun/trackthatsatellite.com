import { useState, useEffect } from "react";
import { getSatelliteName, getCatalogNumber, getSatelliteInfo } from "tle.js";

/**
 *
 */
export default function useSatellitePosition(tle) {
	const [metadata, setMetadata] = useState({
		name: null,
		id: null,
		latLng: {},
		updateInterval: 1000,
		speedMultiplier: 1,
		lastUpdated: null,
		curTimestamp: null
	});
	const { updateInterval } = metadata;

	useEffect(() => {
		setMetadata({
			...metadata,
			name: getSatelliteName(tle),
			id: getCatalogNumber(tle)
		});

		const timer = setInterval(updatePosition, updateInterval);

		return () => {
			clearInterval(timer);
		}
	}, []);

	useEffect(() => {
		setMetadata({
			...metadata,
			name: getSatelliteName(tle)
		});
	}, [tle]);

	function updatePosition() {
		const now = Date.now();
		//const now = 1580372100000;

		let satMeta;
		try {
			satMeta = getSatelliteInfo(tle, now);
		} catch(e) {
			// Orbit may be decayed.
			console.error(e);
			return;
		}

		setMetadata({
			...metadata,
			latLng: { lat: satMeta.lat, lng: satMeta.lng },
			elevation: satMeta.elevation,
			lastUpdated: now,
			curTimestamp: now
		});
	}

	function setSpeedMultiplier(speedMultiplier = 1) {
		setMetadata({
			...metadata,
			speedMultiplier
		});
	}

	return [metadata, { setSpeedMultiplier }];
}
