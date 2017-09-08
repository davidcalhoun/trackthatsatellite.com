import React, { Component, PropTypes } from 'react';

import styles from './MapWebGL.css';

/**
 * Container for MapboxGL instance.
 */
export default class MapWebGL extends Component {
  constructor() {
    super();
  }

  shouldComponentUpdate() {
    // This is a WebGL map view powered by Mapbox, so there's nothing for React to manage here.
    return false;
  }

  render() {
    return (
      <div id={this.props.id} className={styles.container} />
    );
  }
}