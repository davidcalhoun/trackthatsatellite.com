import React from 'react';
import tle from 'tle.js';
import MapControls from '../../components/MapControls/MapControls';
import SatelliteMetaData from '../../components/SatelliteMetaData/SatelliteMetaData';
import MapWebGL from '../../components/MapWebGL/MapWebGL';

import R from 'ramda';

import styles from './MapView.css';

export default class MapView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isStyleLoaded: false
    };

    [
      'addLngLatsToMap',
      'getUserGeolocation',
      'handleVisibilityChange',
      'handleStyleLoaded',
      'handleStyleUnloaded',
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
    this.props.actions.mapInit({
      container: styles.map,
      onStyleLoaded: this.handleStyleLoaded,
      onStyleUnloaded: this.handleStyleUnloaded
    });

    document.addEventListener('visibilitychange', this.handleVisibilityChange, false);
  }

  componentWillUnmount() {
    this.props.actions.mapDestroy();
    window.clearInterval(this.updateInterval);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.isStyleLoaded) return;

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

      if (satelliteChanged && !this.props.map.is3dView) {
        this.props.map.mapInstance.setCenter([0, 0]);
        this.props.map.mapInstance.setZoom(0);
      }
    }
  }

  handleVisibilityChange() {
    const now = Date.now();

    if (document.hidden) {
      this.docHiddenTimeMS = now;
      // TODO: remove satellite icon
    } else {
      // Page visible again.
      const MS_IN_TEN_MINUTES = 600000;
      const shouldMapRefresh = now - this.docHiddenTimeMS > MS_IN_TEN_MINUTES;

      if (shouldMapRefresh) {
        console.log('User was away for an extended period.');
        this.getUserGeolocation();
      }
    }
  }

  userGeoSuccess(location, bypassCaching) {
    if (!location.coords) return;

    const userLonLat = [location.coords.longitude, location.coords.latitude];
    this.props.actions.setUserLonLat(userLonLat);

    if (!bypassCaching) {
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
    const map = this.props.map.mapInstance;

    const userPoint = {
      'type': 'Point',
      'coordinates': lonLat
    };
    const sourceName = 'user';
    const source = map.getSource(sourceName);

    if (!source) {
      // Init
      map.addSource(sourceName, {
        'type': 'geojson',
        'data': userPoint
      });

      map.addLayer({
        'id': sourceName,
        'source': sourceName,
        'type': 'circle',
        'paint': {
          'circle-radius': 10,
          'circle-color': 'green'
        }
      });
    } else {
      map.getSource(sourceName).setData(userPoint);
    }
  }

  updateSatPosition(lonLat) {
    if (!this.state.isStyleLoaded) return;

    const map = this.props.map.mapInstance;

    const satPoint = {
      'type': 'Point',
      'coordinates': lonLat
    };
    const sourceName = 'sat';
    const source = map.getSource(sourceName);

    if (!source) {
      // Init
      map.addSource(sourceName, {
        'type': 'geojson',
        'data': satPoint
      });

      map.addLayer({
        'id': sourceName,
        'source': sourceName,
        'type': 'circle',
        'paint': {
          'circle-radius': 10,
          'circle-color': '#007cbf'
        }
      });
    } else {
      map.getSource(sourceName).setData(satPoint);
    }
  }

  addLngLatsToMap(llArr) {
    const map = this.props.map.mapInstance;

    const lineColors = [
      '#aaaaaa',  // prev orbit
      '#6d6d6d',  // cur orbit
      '#61d877'   // next orbit
    ];

    // Clear out old tracks.
    [1, 2, 3].forEach(index => {
      const sourceName = `track${index}`;

      const source = map.getSource(sourceName);

      source && source.setData({
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': [ [] ]
        }
      });
    });

    // todo: construct FeatureCollection instead here?
    llArr.forEach((line, index) => {
      const sourceName = `track${index}`;
      const source = map.getSource(sourceName);

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
        map.addLayer({
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
        source.setData(orbitTrackData);
      }
    });
  }

  updateSatLonLat(optionalProps) {
    const props = optionalProps || this.props;

    if (!props.satellite.tle || props.satellite.tle.length === 0) {
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

    if (this.props.map.is3dView && !props.user.timestampOverride) {
      props.actions.setMapBearing(this.props.satellite.bearing.degrees.toFixed(2));
      props.map.mapInstance.setCenter(lonLatArr)
    }
  }

  handleStyleLoaded() {
    this.setState({ isStyleLoaded: true });

    this.updateGroundTrack();
    this.updateSatLonLat()
    if (!this.updateInterval) this.updateInterval = window.setInterval(this.updateSatLonLat, 1000);

    if (this.props.user.lonLat.length === 0) {
      this.getUserGeolocation();
    } else {
      this.updateUserPosition(this.props.user.lonLat);
    }
  }

  handleStyleUnloaded() {
    this.setState({ isStyleLoaded: false });
  }

  updateGroundTrack(optionalProps) {
    const props = optionalProps || this.props;

    if (!props.satellite.tle || props.satellite.tle.length === 0) {
      console.warn('No satellite TLE set');
      return;
    }

    const userTimestampOverride = props.user.timestampOverride;
    const timestamp = (userTimestampOverride) ? userTimestampOverride : Date.now();
    const groundTrackArr = tle.getGroundTrackLngLat(props.satellite.tle, 1000, timestamp);
    this.addLngLatsToMap(groundTrackArr);
  }

  render() {
    return (
    <main
      className={styles.container}
      role="main"
    >
      <SatelliteMetaData {...this.props} />
      <MapControls {...this.props} />
      <MapWebGL id={styles.map} />
    </main>
    );
  }
};