import Nav from './Nav';
import React, { Component, PropTypes } from 'react';
import SatelliteInput from './SatelliteInput';
import R from 'ramda';

import styles from './Header.css';

export default class Header extends Component {
  constructor(props) {
    super(props);

    this.state = { hasError: false };
  }

  componentWillMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  /**
   * Handles errors in the component subtree.
   */
  componentDidCatch(error, info) {
    this.setState({ hasError: true });
    console.warn(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (<div><h1>Error in Header</h1></div>)
    }

    return (
      <header
        className={styles.container}
        role="banner"
      >
        <h1 className={styles.heading}>Track That Satellite</h1>
        <SatelliteInput {...this.props} />
        <Nav {...this.props} />
      </header>
    );
  }
}