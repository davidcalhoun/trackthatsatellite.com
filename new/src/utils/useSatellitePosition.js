import { useState, useEffect } from "react";
import * as TLEJS from "tle.js";

const tlejs = new TLEJS();

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
	if (!metadata) {
		console.log(3333, metadata, setMetadata)
	}
	const { updateInterval } = metadata;

	useEffect(() => {
		setMetadata({
			...metadata,
			name: tlejs.getSatelliteName(tle),
			id: tlejs.getSatelliteNumber(tle)
		});

		const timer = setInterval(updatePosition, updateInterval);

		return () => {
			clearInterval(timer);
		}
	}, []);

	useEffect(() => {
		setMetadata({
			...metadata,
			name: tlejs.getSatelliteName(tle)
		});
	}, [tle]);

	function updatePosition() {
		const now = Date.now();

		let satMeta;
		try {
			satMeta = tlejs.getSatelliteInfo(tle, now);
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
