import React from 'react';
import TLEJS from 'tle.js';
const tle = new TLEJS();
import MapWebGL from '../../components/MapWebGL/MapWebGL';
import { MAPBOX_ACCESS_TOKEN } from '../../config';
import Switch from 'material-ui/Switch';
import Button from 'material-ui/Button';
import R from 'ramda';
import littleTime from 'little-time';

import styles from './MapView.css';

export default class MapView extends React.Component {
  constructor() {
    super();

    this.mapIsLoaded = false;

    [
      'addLngLatsToMap',
      'getUserGeolocation',
      'handle3DToggle',
      'handleSatelliteToggle',
      'handleVisibilityChange',
      'handleSourceDataLoaded',
      'handleTimeSliderChange',
      'handleMinus',
      'handlePlus',
      'mapLoaded',
      'setBearing',
      'updateSatLonLat',
      'updateSatPosition',
      'updateUserPosition',
      'userGeoSuccess',
      'userGeoError',
      'updateGroundTrack'
    ].forEach(fn => this[fn] = this[fn].bind(this));
  }

  componentWillMount() {

  }

  componentDidMount() {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    this.map = new mapboxgl.Map({
      container: styles.map,
      style: 'mapbox://styles/mapbox/outdoors-v10',
    });

    // Add zoom/compass controls.
    const navControl = new mapboxgl.NavigationControl();
    this.map.addControl(navControl, 'top-left');

    this.map.on('load', this.mapLoaded);
    this.map.on('sourcedata', this.handleSourceDataLoaded);

    document.addEventListener('visibilitychange', this.handleVisibilityChange, false);
  }

  componentWillUnmount() {
    this.map = null;
    window.clearInterval(this.updateInterval);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.mapIsLoaded) {
      console.warn('Map is not ready');
      return;
    }

    const satLonLatChanged = this.props.satellite.lonLat !== nextProps.satellite.lonLat;
    if (satLonLatChanged) {
      this.updateSatPosition(nextProps.satellite.lonLat);
    }

    const userLonLatChanged = this.props.user.lonLat !== nextProps.user.lonLat;
    if (userLonLatChanged) {
      this.updateUserPosition(nextProps.user.lonLat);
    }

    const userTimeChanged = this.props.user.timestampOverride !== nextProps.user.timestampOverride;
    const satelliteChanged = this.props.satellite.name !== nextProps.satellite.name;
    if (satelliteChanged || userTimeChanged) {
      this.updateSatLonLat(nextProps);
      this.updateGroundTrack(nextProps);
    }
  }

  handleVisibilityChange() {
    const now = Date.now();

    if (document.hidden) {
      this.docHiddenTimeMS = now;
    } else {
      // Page visible again.
      const MS_IN_TEN_MINUTES = 600000;
      const shouldMapRefresh = now - this.docHiddenTimeMS > MS_IN_TEN_MINUTES;
      if (shouldMapRefresh) {
        console.log('User was away for an extended period, so re-initting map tracks.');
        this.mapLoaded();
      }
    }
  }

  userGeoSuccess(location, bypassCaching) {
    if (!location.coords) return;

    const userLonLat = [location.coords.longitude, location.coords.latitude];
    this.props.actions.setUserLonLat(userLonLat);

    if (!bypassCaching) {
      console.log(111, location)
      window.localStorage.setItem('geolocation', JSON.stringify({
        coords: {
          longitude: location.coords.longitude,
          latitude: location.coords.latitude
        }
      }));
    }
  }

  userGeoError(err) {
    console.log('error getting geolocation: ', err.message)
    this.props.actions.setUserDeniedGeolocation();
  }

  getUserGeolocation() {
    const cachedLocation = window.localStorage.getItem('geolocation');
    if (cachedLocation) {
      let cachedLocationObj;
      try {
        cachedLocationObj = JSON.parse(cachedLocation);
        this.userGeoSuccess(cachedLocationObj, true);
      } catch(e) {
        console.warn('Error parsing cached geolocation');
      }
    }

    navigator.geolocation.getCurrentPosition(this.userGeoSuccess, this.userGeoError);
  }

  updateUserPosition(lonLat) {
    const userPoint = {
      'type': 'Point',
      'coordinates': lonLat
    };
    const sourceName = 'user';
    const source = this.map.getSource(sourceName);

    if (!source) {
      // Init
      this.map.addSource(sourceName, {
        'type': 'geojson',
        'data': userPoint
      });

      this.map.addLayer({
        'id': sourceName,
        'source': sourceName,
        'type': 'circle',
        'paint': {
          'circle-radius': 10,
          'circle-color': 'green'
        }
      });
    } else {
      this.map.getSource(sourceName).setData(userPoint);
    }
  }

  updateSatPosition(lonLat) {
    if (!this.isStyleLoaded) return;

    const satPoint = {
      'type': 'Point',
      'coordinates': lonLat
    };
    const sourceName = 'sat';
    const source = this.map.getSource(sourceName);

    if (!source) {
      // Init
      this.map.addSource(sourceName, {
        'type': 'geojson',
        'data': satPoint
      });

      this.map.addLayer({
        'id': sourceName,
        'source': sourceName,
        'type': 'circle',
        'paint': {
          'circle-radius': 10,
          'circle-color': '#007cbf'
        }
      });
    } else {
      this.map.getSource(sourceName).setData(satPoint);
    }
  }

  addLngLatsToMap(llArr) {
    const lineColors = [
      '#aaaaaa',  // prev orbit
      '#6d6d6d',  // cur orbit
      '#61d877'   // next orbit
    ]

    // todo: construct FeatureCollection instead here?
    llArr.forEach((line, index) => {
      const sourceName = `track${index}`;
      const source = this.map.getSource(sourceName);

      const orbitTrackData = {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': line
        }
      };

      if (!source) {
        // init
        this.map.addLayer({
          'id': `track${index}`,
          'type': 'line',
          'source': {
            'type': 'geojson',
            'data': orbitTrackData
          },
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': lineColors[index],
            'line-width': 3,
            'line-opacity': 0.6
          }
        });
      } else {
        // update
        this.map.getSource(sourceName).setData(orbitTrackData);
      }


    });

  }

  updateSatLonLat(optionalProps) {
    const props = optionalProps || this.props;

    if (props.satellite.tle.length === 0) {
      console.warn('No satellite TLE set');
      return;
    }

    // Don't update if map isn't onscreen.
    if (document.hidden) return;

    const timestamp = (props.user.timestampOverride) ? props.user.timestampOverride : Date.now();
    const userLonLat = props.user.lonLat;

    let satInfo;
    if (userLonLat) {
      satInfo = tle.getSatelliteInfo(
        props.satellite.tle,
        timestamp,
        userLonLat[1],
        userLonLat[0]
      );
    } else {
      satInfo = tle.getSatelliteInfo(
        props.satellite.tle,
        timestamp
      );
    }

    const lonLatArr = [ satInfo.lng, satInfo.lat ];
    const bearing = tle.getSatBearing(props.satellite.tle, timestamp);

    props.actions.setSatelliteLonLat(lonLatArr);
    props.actions.setSatelliteBearing(bearing);

    const { elevation, azimuth, range } = satInfo;
    props.actions.setSatelliteLookAngles({
      elevation,
      azimuth,
      range
    });

    if (this.is3DView && !props.user.timestampOverride) {
      this.setBearing();
      this.map.setCenter(lonLatArr)
    }
  }

  mapLoaded() {
    this.mapIsLoaded = true;
    this.getUserGeolocation();
  }

  handleSourceDataLoaded() {
    if (!this.isStyleLoaded && this.map.isStyleLoaded()) {
      this.isStyleLoaded = true;
      this.updateGroundTrack();
      this.updateInterval = window.setInterval(this.updateSatLonLat, 1000);
    }
  }

  updateGroundTrack(optionalProps) {
    const props = optionalProps || this.props;

    if (props.satellite.tle.length === 0) {
      console.warn('No satellite TLE set');
      return;
    }

    const userTimestampOverride = props.user.timestampOverride;
    const timestamp = (userTimestampOverride) ? userTimestampOverride : Date.now();
    const groundTrackArr = tle.getGroundTrackLngLat(props.satellite.tle, 1000, timestamp);
    this.addLngLatsToMap(groundTrackArr);
  }

  handle3DToggle() {
    this.is3DView = !this.is3DView;

    if (this.is3DView) {
      this.map.setZoom(3);
      this.map.setPitch(60);
      this.setBearing();
      this.map.setCenter([0,0]);
    } else {
      this.map.setZoom(1);
      this.map.setPitch(0);
      this.setBearing(0);
      this.map.setCenter(this.props.satellite.lonLat);
    }
  }

  handleSatelliteToggle() {
    this.isStyleLoaded = false;
    this.isSatelliteView = !this.isSatelliteView;

    let layerId = (this.isSatelliteView) ? 'satellite' : 'outdoors';

    this.map.setStyle(`mapbox://styles/mapbox/${layerId}-v9`);
  }

  setBearing(optionalBearing) {
    const bearing = (typeof optionalBearing === 'number') ? optionalBearing : this.props.satellite.bearing.degrees.toFixed(2);

    this.map.setBearing(bearing);
  }

  handleTimeSliderChange(e) {
    this.props.actions.setUserTime(e.target.value);
  }

  toFixed(val = 0, precision = 2) {
    return val.toFixed(precision);
  }

  handleMinus() {
    const userTimestampOverride = this.props.user.timestampOverride;
    const timestamp = (userTimestampOverride) ? userTimestampOverride : Date.now();
    const timestampAdjusted = timestamp - 10000;
    this.props.actions.setUserTimeMS(timestampAdjusted);
  }

  handlePlus() {
    const userTimestampOverride = this.props.user.timestampOverride;
    const timestamp = (userTimestampOverride) ? userTimestampOverride : Date.now();
    const timestampAdjusted = timestamp + 10000;
    this.props.actions.setUserTimeMS(timestampAdjusted);
  }

  render() {
    const lonLat = this.props.satellite.lonLat;
    const lon = lonLat[0] && this.toFixed(lonLat[0]);
    const lat = lonLat[1] && this.toFixed(lonLat[1]);
    const bearing = R.path(['props', 'satellite', 'bearing'], this);
    const bearingDegrees = R.prop('degrees', bearing) || 0;
    const bearingDegreesForDisplay = bearingDegrees.toFixed(2);
    const compass = R.prop('compass', bearing) || '';

    const userTimestampOverride = this.props.user.timestampOverride;
    const timestamp = (userTimestampOverride) ? userTimestampOverride : Date.now();
    const userTime = littleTime(timestamp).format('ddd MMM Do YYYY HH:mm:ss');

    const lookAngles = this.props.satellite.lookAngles;
    const { elevation, azimuth, range } = lookAngles;
    const elevationDisplay = this.toFixed(elevation);
    const azimuthDisplay = this.toFixed(azimuth);
    const rangeDisplay = this.toFixed(range);

    return (
    <section className={styles.container}>
      <div className={styles.toggleContainer}>
        <label htmlFor={styles.toggleThreed}>3D</label>
        <Switch id={styles.toggle} onChange={this.handle3DToggle} />
        <label htmlFor={styles.toggleSatellite}>Satellite</label>
        <Switch id={styles.toggleSatellite} onChange={this.handleSatelliteToggle} />
        <label htmlFor={styles.timeSlider}>Time</label>
        <Button
          raised
          className={styles.minus}
          onClick={this.handleMinus}
        >
          -10 sec
        </Button>
        <input
          id={styles.timeSlider}
          type="range"
          min="0"
          max="500"
          defaultValue={this.props.user.timeSliderVal}
          onChange={this.handleTimeSliderChange}
        />
        <Button
          raised
          className={styles.plus}
          onClick={this.handlePlus}
        >
          +10 sec
        </Button>
        <span>{userTime}</span>
      </div>
      <p>Lat/lon/bearing: {lat}, {lon} {bearingDegreesForDisplay}° ({compass})</p>
      <p>Azimuth (compass heading): {azimuthDisplay}°, Elevation: {elevationDisplay}°, Range: {rangeDisplay} km</p>
      <MapWebGL id={styles.map} />
    </section>
    );
  }
};