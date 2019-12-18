import React, { Fragment, useState, useEffect } from "react";
import ReactMapboxGl, {
	Layer,
	Feature,
	ScaleControl,
	ZoomControl,
	RotationControl,
	Popup
} from "react-mapbox-gl";
import Button from "@material-ui/core/Button";
import { latLngForDisplay } from "../../utils";
import styles from "./index.css";

export default function MapPopup(props) {
	const { tle, lngLat, name, onClose, elevation } = props;

	return (
		<Popup coordinates={lngLat} className={styles.container}>
			<p>{name}</p>
			<p>Position: {latLngForDisplay(lngLat)}</p>
			<p>Elevation: { elevation.toFixed(2) }°</p>
			<footer className={styles.footer}>
				<Button variant="contained" color="primary" onClick={onClose}>
					Close
				</Button>
			</footer>
		</Popup>
	);
}
