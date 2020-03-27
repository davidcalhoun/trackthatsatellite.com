import React, { Fragment, useState, useEffect } from "react";
import ReactMapboxGl, {
	Layer,
	Feature,
	ScaleControl,
	ZoomControl,
	RotationControl
} from "react-mapbox-gl";
import { getGroundTracks } from "tle.js";

const getLineColorFromTrackIndex = index => {
	switch(index) {
		case 0:
			return "rgba(140, 140, 140, 0.3)";
		case 1:
			return "rgba(240, 240, 240, 0.8)";
		case 2:
		default:
			return "rgba(44, 255, 0, 0.3)";
	}
}

export default function GroundTrack({ tle, baseTime }) {
	const [groundTracks, setGroundTracks] = useState([]);

	useEffect(() => {
		updateGroundTracks();
	}, [tle, baseTime]);

	async function updateGroundTracks() {
		const tracks = await getGroundTracks({
			tle,
			startTimeMS: Date.now(),
			stepMS: 1000
		});

		console.log(222, tracks)
		setGroundTracks(tracks);
	}

	return (
		<Fragment>
			{groundTracks.map((coordinates, index) => {
				const lineColor = getLineColorFromTrackIndex(index);

				return (
					<Layer
						key={coordinates[0].toString()}
						type="line"
						paint={{
							"line-color": lineColor,
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
