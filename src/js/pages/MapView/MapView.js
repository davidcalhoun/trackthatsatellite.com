import React from 'react';

import tle from 'tle.js';

import { MAPBOX_ACCESS_TOKEN } from '../../config';

import styles from './MapView.css';

export default class MapView extends React.Component {
  constructor() {
    super();

    [
      'mapLoaded'
    ].forEach(fn => this[fn] = this[fn].bind(this));
  }

  addLatLngsToMap(latLngArr, map) {
    map.addLayer({
        "id": "route",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "LineString",
                    "coordinates": latLngArr
                }
            }
        },
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#888",
            "line-width": 8
        }
    });
  }

  mapLoaded() {
    const tleStr = `ISS (ZARYA)
1 25544U 98067A   17207.85089522  .00000752  00000-0  18587-4 0  9993
2 25544  51.6402 200.6049 0006226  77.3560 350.9035 15.54225878 67921`;

    const groundTrackArr = tle.getGroundTrackLngLat(tleStr);

    this.addLatLngsToMap(groundTrackArr, this.map);
  }

  componentDidMount() {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    this.map = new mapboxgl.Map({
      container: styles.map,
      style: 'mapbox://styles/mapbox/streets-v10',
      zoom: 1
    });

    this.map.on('load', this.mapLoaded);
  }

  render() {
    return (
    <section className={styles.container}>
      <h2 className={styles.title}>MapView</h2>
      <div id={styles.map}></div>
    </section>
    );
  }
};