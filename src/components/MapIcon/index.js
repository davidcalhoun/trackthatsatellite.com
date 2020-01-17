import React, { Fragment, useEffect, useState } from "react";
import ReactMapboxGl, {
	Layer,
	Feature,
	ScaleControl,
	ZoomControl,
	RotationControl,
	Popup
} from "react-mapbox-gl";

export default function MapIcon(props) {
	const { src, name, longitude, latitude } = props;
	const [images, setImages] = useState([]);

	let icon;
	useEffect(() => {
		icon = new Image(20, 20);
		icon.src = src;
		setImages([`${name}-icon`, icon]);
	}, []);

	if (!images.length) return <Fragment />;

	return (
		<Layer
			type="symbol"
			id="home"
			layout={{
				"icon-image": `${name}-icon`,
				"icon-allow-overlap": true
			}}
			images={images}
		>
			<Feature coordinates={[longitude, latitude]} />
		</Layer>
	);
}
