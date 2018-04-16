import React from 'react';
import TLEJS from 'tle.js';
const tle = new TLEJS();
import MapControls from '../../components/MapControls/MapControls';
import SatelliteMetaData from '../../components/SatelliteMetaData/SatelliteMetaData';
import MapWebGL from '../../components/MapWebGL/MapWebGL';

import { toFixed } from '../../utils';
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
    const satelliteChanged = this.props.satellite.tle !== nextProps.satellite.tle;
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
        console.info('User was away for an extended period - updating geolocation.');
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
      "type": "Feature",
      "geometry": {
          "type": "Point",
          "coordinates": lonLat
      },
      "properties": {
          "title": "Your Location",
          "icon": "marker"
      }
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
        'type': 'symbol',
        "layout": {
            "icon-image": "{icon}-15",
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
        },
        "paint": {
            "text-color": "#212121",
            "text-halo-color": "#fff",
            "text-halo-width": 0.5
        }
      });
    } else {
      map.getSource(sourceName).setData(userPoint);
    }
  }

  updateSatPosition(lonLat) {
    if (!this.state.isStyleLoaded) return;

    const map = this.props.map.mapInstance;

    const satTitle = `${ toFixed(lonLat[1]) }, ${ toFixed(lonLat[0]) }`;

    const lookAngles = this.props.satellite.lookAngles;
    const { elevation, azimuth, range } = lookAngles;
    const elevationDisplay = toFixed(elevation);
    const azimuthDisplay = toFixed(azimuth);
    const rangeDisplay = toFixed(range);

    const satPoint = {
      "type": "Feature",
      "geometry": {
          "type": "Point",
          "coordinates": lonLat
      },
      "properties": {
          "title": satTitle,
          "icon": "rocket",
          "description": `<h4>Position relative to observer</h4><p>Azimuth (compass heading): ${ azimuthDisplay }°</p><p>Elevation: ${ elevationDisplay }°</p><p>Range: ${ rangeDisplay } km</p>`
      }
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
        'type': 'symbol',
        "layout": {
            "icon-image": "{icon}-15",
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
        },
        "paint": {
            "text-color": "#212121",
            "text-halo-color": "#fff",
            "text-halo-width": 0.5
        }
      });

      const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false
      });

      map.on('mouseenter', sourceName, function(e) {
          // Change the cursor style as a UI indicator.
          map.getCanvas().style.cursor = 'pointer';

          var coordinates = e.features[0].geometry.coordinates.slice();
          var description = e.features[0].properties.description;

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          // Populate the popup and set its coordinates
          // based on the feature found.
          popup.setLngLat(coordinates)
              .setHTML(description)
              .addTo(map);
      });

      map.on('mouseleave', sourceName, function() {
          map.getCanvas().style.cursor = '';
          popup.remove();
      });
    } else {
      map.getSource(sourceName).setData(satPoint);
    }
  }

  addLngLatsToMap(llArr) {
    const map = this.props.map.mapInstance;

    const lineStyles = [
      {
        // previous orbit
        color: '#bfbfbf',
        opacity: 0.4,
        width: 3
      },
      {
        // current orbit
        color: '#ffff00',
        opacity: 0.8,
        width: 3
      },
      {
        // next orbit
        color: '#ffff00',
        opacity: 0.4,
        width: 3
      }
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
            'line-color': lineStyles[index].color,
            'line-width': lineStyles[index].width,
            'line-opacity': lineStyles[index].opacity
          }
        });
      } else {
        // update
        source.setData(orbitTrackData);
      }
    });
  }

  updateSatLonLat(optionalProps) {
    // Noop if map isn't onscreen.
    if (document.hidden) return;

    const props = optionalProps || this.props;

    if (!props.satellite.tle || props.satellite.tle.length === 0) {
      //console.info('No satellite TLE set');
      return;
    }

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
      //console.info('No satellite TLE set');
      return;
    }

    const userTimestampOverride = props.user.timestampOverride;
    const timestamp = (userTimestampOverride) ? userTimestampOverride : Date.now();
    const groundTrackArr = tle.getGroundTrackLngLat(props.satellite.tle, 1000, timestamp);
    this.addLngLatsToMap(groundTrackArr);

    // Pre-compute future ground tracks
    const ONE_HOUR_IN_MS = 1000 * 60 * 60;
    window.setTimeout(() => tle.getGroundTrackLngLat(props.satellite.tle, 1000, timestamp + ONE_HOUR_IN_MS), 1000);
    window.setTimeout(() => tle.getGroundTrackLngLat(props.satellite.tle, 1000, timestamp + ONE_HOUR_IN_MS * 2), 2000);
    window.setTimeout(() => tle.getGroundTrackLngLat(props.satellite.tle, 1000, timestamp + ONE_HOUR_IN_MS * 3), 3000);
  }

  render() {
    return (
    <main
      className={styles.container}
      role="main"
    >
      <MapControls {...this.props} />
      <MapWebGL id={styles.map} />
    </main>
    );
  }
};