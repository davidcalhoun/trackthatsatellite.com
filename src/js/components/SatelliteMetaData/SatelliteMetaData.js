import React, { Component, PropTypes } from 'react';
import path from 'ramda/src/path';
import prop from 'ramda/src/prop';

import { toFixed } from '../../utils';
import styles from './SatelliteMetaData.css';

export default class SatelliteMetaData extends Component {
  render() {
    const lookAngles = this.props.satellite.lookAngles;
    const { elevation, azimuth, range } = lookAngles;
    const elevationDisplay = toFixed(elevation);
    const azimuthDisplay = toFixed(azimuth);
    const rangeDisplay = toFixed(range);

    return (
      <div className={styles.container}>
        <h3>Relative to current location:</h3>
        <p>Azimuth (compass heading): {azimuthDisplay}°, Elevation: {elevationDisplay}°, Range: {rangeDisplay} km</p>
      </div>
    );
  }
}
