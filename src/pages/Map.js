import React, { Fragment, useEffect, useState } from "react";
import { connect } from "react-redux";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect,
    useRouteMatch,
    useParams,
    useHistory
} from "react-router-dom";
import ReactMapboxGl, {
    Layer,
    Feature,
    ScaleControl,
    ZoomControl,
    RotationControl,
    Popup
} from "react-mapbox-gl";
import { MAPBOX_ACCESS_TOKEN as accessToken, siteName } from "../consts";
import styles from "./Map.css";
import homeSVG from "../static/home.svg";
import satelliteSVG from "../static/fa-satellite.svg";
import { UPDATE_VIEW, fetchGeolocation, fetchAllTLEs } from "../actions";
import { getNORADSatNum, latLngForDisplay, satsToURLString } from "../utils";
import {
    GroundTrack,
    SatellitePosition,
    MapPopup,
    MapIcon,
    SunlightTerminator
} from "../components";
import * as TLEJS from "tle.js";
const tlejs = new TLEJS();

const MapboxGl = ReactMapboxGl({
    accessToken
});

export function Map(props) {
    const {
        fetchLocation,
        position,
        tles,
        fetchTLEs,
        selectedSatellites
    } = props;
    let match = useRouteMatch();
    let { satellites: satellitesInURL } = useParams();
    const [groundTracks, setGroundTracks] = useState([]);
    const [sunTerminatorTS, setSunTerminatorTS] = useState(null);
    const history = useHistory();
    const [popup, setPopup] = useState({ popupIsVisible: false });
    const {
        tle: popupTLE,
        lngLatArr: popupLngLat,
        isVisible: popupIsVisible,
        name: popupSatName,
        elevation: popupSatElevation
    } = popup;

    const layerId = true ? "satellite" : "outdoors";
    const style = `mapbox://styles/mapbox/${layerId}-v9`;

    function init() {
        document.title = `Map - ${siteName}`;

        props.updateView("map");

        if (!position) {
            fetchLocation();
        }

        if (Object.keys(tles).length === 0) {
            fetchTLEs({
                selectedSatellites: [getNORADSatNum(satellitesInURL)]
            });
        }

        setSunTerminatorTS(Date.now());
    }
    useEffect(init, []);

    useEffect(() => {
        const selectedSats = satsToURLString(selectedSatellites);

        if (
            selectedSats &&
            satellitesInURL &&
            satellitesInURL !== selectedSats
        ) {
            history.replace(`/map/${selectedSats}`);
        }
    }, [selectedSatellites]);

    const { coords } = position || { coords: {} };
    const { latitude, longitude } = coords;

    function updatePopup({ isVisible, tle, lngLatArr, name, elevation }) {
        setPopup({
            isVisible,
            tle,
            lngLatArr,
            name,
            elevation
        });
    }

    return (
        <MapboxGl
            style={style}
            containerStyle={{}}
            className={styles.mapContainer}
            zoom={[1]}
            center={[-0.120736, 51.5118219]}
            circleRadius={30}
        >
            <SunlightTerminator timestampMS={sunTerminatorTS} />
            <ZoomControl />
            <RotationControl style={{ top: 80 }} />

            {popupIsVisible && (
                <MapPopup
                    key={popupSatName}
                    lngLat={popupLngLat}
                    tle={popupTLE}
                    name={popupSatName}
                    elevation={popupSatElevation}
                    onClose={() => {
                        setPopup({ ...popup, isVisible: false });
                    }}
                />
            )}

            {selectedSatellites.map(tle => {
                return (
                    <Fragment key={tle}>
                        <SatellitePosition
                            tle={tle}
                            updatePopup={updatePopup}
                            popupIsVisible={popupIsVisible}
                        />
                        <GroundTrack tle={tle} baseTime={Date.now()} />
                    </Fragment>
                );
            })}

            {
                longitude && latitude && (
                    <MapIcon
                        name="home"
                        longitude={longitude}
                        latitude={latitude}
                        src={homeSVG}
                    />
                )
            }
        </MapboxGl>
    );
}

const mapStateToProps = (state /*, ownProps*/) => {
    return {
        currentView: state.view.currentView,
        position: state.geolocation.position,
        tles: state.tles.all,
        selectedSatellites: state.tles.selectedSatellites
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchLocation: () => dispatch(fetchGeolocation()),
        updateView: view => dispatch({ type: UPDATE_VIEW, view }),
        fetchTLEs: options => dispatch(fetchAllTLEs(options))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Map);
