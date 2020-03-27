import React, { Fragment, useState, useEffect } from "react";
import ReactMapboxGl, {
    Layer,
    Feature,
    ScaleControl,
    ZoomControl,
    RotationControl
} from "react-mapbox-gl";
import { useSatellitePosition, getSatelliteDisplayName } from "../../utils";

export default function SatellitePosition({
    tle,
    timestamp,
    updatePopup,
    popupIsVisible
}) {
    const [
        { name, id, latLng, curTimestamp, elevation },
        { setSpeedMultiplier }
    ] = useSatellitePosition(tle);
    const { lat, lng } = latLng;

    const displayName = getSatelliteDisplayName(tle);

    const POSITION_CIRCLE_PAINT = {
        "circle-stroke-width": 4,
        "circle-radius": 10,
        "circle-blur": 0.15,
        "circle-color": "#3770C6",
        "circle-stroke-color": "white"
    };

    function onToggleHover(cursor, { map }) {
        map.getCanvas().style.cursor = cursor;
    }

    function handleUpdatePopup(show = false) {
        if (!lng || !lat || (!popupIsVisible && !show)) return;
        updatePopup({
            tle,
            lngLatArr: [lng, lat],
            isVisible: show,
            name: displayName,
            elevation
        });
    }

    useEffect(() => {
        handleUpdatePopup(popupIsVisible);
    }, [latLng]);

    return (
        <Fragment>
            {lat && lng && (
                <Layer type="circle" paint={POSITION_CIRCLE_PAINT}>
                    <Feature
                        coordinates={[lng, lat]}
                        onMouseEnter={onToggleHover.bind(null, "pointer")}
                        onMouseLeave={onToggleHover.bind(null, "")}
                        onClick={handleUpdatePopup.bind(null, true)}
                    />
                </Layer>
            )}
        </Fragment>
    );
}
