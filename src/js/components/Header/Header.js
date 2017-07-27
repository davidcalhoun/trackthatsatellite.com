import React, { Component, PropTypes } from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom';

import styles from './Header.css';

export default class Header extends Component {
  render() {
    return (
      <header className={styles.container}>
        <h1>Track That Satellite</h1>
        <Link to="/" className={styles.map}>Map</Link>
        <Link to="settings" className={styles.settings}>Settings</Link>
      </header>
    );
  }
}