import React from 'react';
import tle from 'tle.js';
import MapWebGL from '../../components/MapWebGL/MapWebGL';
import { MAPBOX_ACCESS_TOKEN } from '../../config';
import Toggle from 'material-ui/Toggle';

import styles from './MapView.css';

const tleStr = `ISS (ZARYA)
1 25544U 98067A   17207.85089522  .00000752  00000-0  18587-4 0  9993
2 25544  51.6402 200.6049 0006226  77.3560 350.9035 15.54225878 67921`;

export default class MapView extends React.Component {
  constructor() {
    super();

    [
      'addLngLatsToMap',
      'getUserGeolocation',
      'handleToggle',
      'mapLoaded',
      'setBearing',
      'updateSatLonLat',
      'updateSatPosition',
      'updateUserPosition',
      'userGeoSuccess',
      'userGeoError'
    ].forEach(fn => this[fn] = this[fn].bind(this));
  }

  componentDidMount() {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    this.map = new mapboxgl.Map({
      container: styles.map,
      style: 'mapbox://styles/mapbox/streets-v10'
    });

    this.map.on('load', this.mapLoaded);
  }

  componentWillUnmount() {
    this.map = null;
    window.clearInterval(this.updateInterval);
  }

  componentWillReceiveProps(nextProps) {
    const satLonLatChanged = this.props.satellite.lonLat !== nextProps.satellite.lonLat;
    if (satLonLatChanged) {
      this.updateSatPosition(nextProps.satellite.lonLat);
    }

    const userLonLatChanged = this.props.user.lonLat !== nextProps.user.lonLat;
    if (userLonLatChanged) {
      this.updateUserPosition(nextProps.user.lonLat);
    }
  }

  userGeoSuccess(location) {
    const userLonLat = [location.coords.longitude, location.coords.latitude];
    this.props.actions.setUserLonLat(userLonLat);
  }

  userGeoError(err) {
    this.props.actions.setUserDeniedGeolocation();
  }

  getUserGeolocation() {
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
      this.map.getSource(sourceName).setData(satPoint);
    }
  }

  updateSatPosition(lonLat) {
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
      this.map.addLayer({
        'id': `track${index}`,
        'type': 'line',
        'source': {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
              'type': 'LineString',
              'coordinates': line
            }
          }
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
    });

  }

  updateSatLonLat() {
    const latLon = tle.getLatLon(tleStr);
    const lonLatArr = [ latLon.lng, latLon.lat ];
    const bearing = tle.getSatBearing(tleStr);

    if (this.is3DView) this.map.setCenter(lonLatArr);

    this.props.actions.setSatelliteLonLat(lonLatArr);
    this.props.actions.setSatelliteBearing(bearing);

    if (this.is3DView) this.setBearing();
  }

  mapLoaded() {
    this.getUserGeolocation();

    const groundTrackArr = tle.getGroundTrackLngLat(tleStr);
    this.addLngLatsToMap(groundTrackArr);
    this.updateInterval = window.setInterval(this.updateSatLonLat, 100);
  }

  handleToggle() {
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

  setBearing(optionalBearing) {
    const bearing = (typeof optionalBearing === 'number') ? optionalBearing : this.props.satellite.bearing.degrees.toFixed(2);

    this.map.setBearing(bearing);
  }

  render() {
    const lonLat = this.props.satellite.lonLat;
    const lon = lonLat[0] && lonLat[0].toFixed(2);
    const lat = lonLat[1] && lonLat[1].toFixed(2);
    const bearing = this.props.satellite.bearing.degrees.toFixed(2);
    const compass = this.props.satellite.bearing.compass;

    const toggleStyles = {
      block: {
        maxWidth: 250,
      },
      toggle: {
        marginBottom: 16,
      },
      thumbOff: {
        backgroundColor: '#ffcccc',
      },
      trackOff: {
        backgroundColor: '#ff9d9d',
      },
      thumbSwitched: {
        backgroundColor: 'red',
      },
      trackSwitched: {
        backgroundColor: '#ff9d9d',
      },
      labelStyle: {
        color: 'red',
      },
    };

    return (
    <section className={styles.container}>
      <div className={styles.toggle}>
        <Toggle
          label="3D View"
          onToggle={this.handleToggle}
          thumbStyle={styles.thumbOff}
          trackStyle={styles.trackOff}
          thumbSwitchedStyle={styles.thumbSwitched}
          trackSwitchedStyle={styles.trackSwitched}
          labelStyle={styles.labelStyle}
        />
      </div>
      <p>Lat/lon/bearing: {lat}, {lon} {bearing}° ({compass})</p>
      <MapWebGL id={styles.map} />
    </section>
    );
  }
};