import React, { Fragment, useState, useEffect } from "react";
import ReactMapboxGl, {
	Layer,
	Feature,
	ScaleControl,
	ZoomControl,
	RotationControl
} from "react-mapbox-gl";
import * as TLEJS from "tle.js";
const tlejs = new TLEJS();

export default function GroundTrack({ tle, baseTime }) {
	const [groundTracks, setGroundTracks] = useState([]);

	useEffect(() => {
		const tracks = tlejs.getGroundTrackLngLat(tle, 1000, Date.now());
		setGroundTracks(tracks);
	}, [tle, baseTime]);

	return (
		<Fragment>
			{groundTracks.map(coordinates => {
				return (
					<Layer
						key={coordinates[0].toString()}
						type="line"
						paint={{
							"line-color": "#888",
							"line-width": 2
						}}
					>
						<Feature coordinates={coordinates} />
					</Layer>
				);
			})}
		</Fragment>
	);
}
