import React, { Component, PropTypes } from 'react';

import styles from './MapWebGL.css';

export default class MapWebGL extends Component {
  constructor() {
    super();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div id={this.props.id} />
    );
  }
}