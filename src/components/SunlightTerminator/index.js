import React, { Fragment, useState, useEffect, useMemo } from "react";
import ReactMapboxGl, {
	Layer,
	Feature,
	ScaleControl,
	ZoomControl,
	RotationControl
} from "react-mapbox-gl";
import { getSunlightTerminatorCoords } from "../../utils";

export default function SunlightTerminator({ timestampMS = Date.now() }) {
	// return null;

	const [coordinates, setCoordinates] = useState(null);

	function init() {
		console.time("getSunlightTerminatorCoords");
		const coords = getSunlightTerminatorCoords(timestampMS);
		console.timeEnd("getSunlightTerminatorCoords");
		setCoordinates(coords);
	}
	useEffect(init, []);

	if(!coordinates || coordinates.length === 0) return null;
console.log(111, coordinates)
	return (
		<Fragment>
			<Layer
				key="terminator"
				type="line"
				paint={{
					"line-color": "red",
					"line-width": 5
				}}
			>
				<Feature coordinates={coordinates[0]} />
			</Layer>
			<Layer
				key={`${coordinates[0].toString()}-fill`}
				type="fill"
				paint={{
					"fill-color": "black",
					"fill-opacity": 0.75,
					"fill-outline-color": "transparent"
				}}
			>
				<Feature coordinates={coordinates} />
			</Layer>
		</Fragment>
	);
}
