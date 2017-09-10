import React, { Component, PropTypes } from 'react';
import R from 'ramda';

import styles from './SatelliteMetaData.css';

export default class SatelliteMetaData extends Component {
  constructor(props) {
    super(props);
  }

  toFixed(val = 0, precision = 2) {
    return val.toFixed(precision);
  }

  render() {
    const lonLat = this.props.satellite.lonLat;
    const lon = lonLat[0] && this.toFixed(lonLat[0]);
    const lat = lonLat[1] && this.toFixed(lonLat[1]);
    const bearing = R.path(['props', 'satellite', 'bearing'], this);
    const bearingDegrees = R.prop('degrees', bearing) || 0;
    const bearingDegreesForDisplay = bearingDegrees.toFixed(2);
    const compass = R.prop('compass', bearing) || '';
    const lookAngles = this.props.satellite.lookAngles;
    const { elevation, azimuth, range } = lookAngles;
    const elevationDisplay = this.toFixed(elevation);
    const azimuthDisplay = this.toFixed(azimuth);
    const rangeDisplay = this.toFixed(range);

    return (
      <div className={styles.container}>
        <p>Lat/lon/bearing: {lat}, {lon} {bearingDegreesForDisplay}° ({compass})</p>
        <p>Azimuth (compass heading): {azimuthDisplay}°, Elevation: {elevationDisplay}°, Range: {rangeDisplay} km</p>
      </div>
    );
  }
}