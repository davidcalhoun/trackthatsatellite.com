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
	const [coordinates, setCoordinates] = useState(null);

	function init() {
		console.time("getSunlightTerminatorCoords");
		const coords = getSunlightTerminatorCoords(timestampMS);
		console.timeEnd("getSunlightTerminatorCoords");
		setCoordinates(coords);
	}
	useEffect(init, []);

	console.log(444, coordinates)

	if(!coordinates || coordinates.length === 0) return null;

	// TODO find which pole is in darkness, adjust lat to -90 or 90 accordingly
	// const fillCoords = [
	// 	[
	// 		[180, 90],
	// 		[-179.99999999, 90],
	// 		[-179.99999999, coordinates[0][1]],
	// 		...coordinates,
	// 		[180, coordinates[coordinates.length - 1][1]]
	// 	]
	// ];

	// TODO: only works when north is in winter, need to invert logic for summer
	const fillCoords = [
		[
			[180, 90],
			[-179.99999999, 90],
			[-179.99999999, coordinates[0][1]],
			...coordinates,
			[180, coordinates[coordinates.length - 1][1]]
		]
	];

	return (
		<Fragment>
			{/* <Layer */}
			{/* 	key={coordinates[0].toString()} */}
			{/* 	type="line" */}
			{/* 	paint={{ */}
			{/* 		"line-color": "yellow", */}
			{/* 		"line-width": 2 */}
			{/* 	}} */}
			{/* > */}
			{/* 	<Feature coordinates={fillCoords[0]} /> */}
			{/* </Layer> */}
			<Layer
				key={`${coordinates[0].toString()}-fill`}
				type="fill"
				paint={{
					"fill-color": "black",
					"fill-opacity": 0.75
				}}
			>
				<Feature coordinates={fillCoords} />
			</Layer>
		</Fragment>
	);
}
