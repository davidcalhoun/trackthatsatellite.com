import React, { Fragment, useState, useEffect } from "react";
import ReactMapboxGl, {
	Layer,
	Feature,
	ScaleControl,
	ZoomControl,
	RotationControl,
	Marker
} from "react-mapbox-gl";
import Button from "@material-ui/core/Button";
import { latLngForDisplay } from "../../utils";
import styles from "./index.css";

export default function MapPopup(props) {
	const { tle, lngLat, name, onClose, elevation } = props;

	return (
		<Marker
			coordinates={lngLat}
			className={styles.container}
			anchor="top"
			offset={{
				top: [0, 30]
			}}
		>
			<header className={styles.header}>
				<p>{name}</p>
			</header>
			<div className={styles.main}>
				<p>{latLngForDisplay(lngLat)}</p>
				<p>Elevation: {elevation.toFixed(2)}°</p>
			</div>
			{/* <footer className={styles.footer}> */}
			{/* 	<Button variant="contained" color="primary" onClick={onClose}> */}
			{/* 		Close */}
			{/* 	</Button> */}
			{/* </footer> */}
		</Marker>
	);
}
