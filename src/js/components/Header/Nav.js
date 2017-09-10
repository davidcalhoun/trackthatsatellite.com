import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

import styles from './Nav.css';

export default class Nav extends Component {
  constructor(props) {
    super(props);

    this.state = { hasError: false };
  }

  /**
   * Handles errors in the component subtree.
   */
  componentDidCatch(error, info) {
    this.setState({
      hasError: true,
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (<div><h1>Error in Nav</h1></div>);
    }

    return (
      <nav
        className={styles.container}
        role="navigation"
      >
        <NavLink
          to="/"
          exact
          activeClassName="active"
          className={`${styles.navLink} fa fa-globe`}
          aria-label="View Map"
          title="Map"
        />
        <NavLink
          to="/settings"
          activeClassName="active"
          className={`${styles.navLink} fa fa-gear`}
          aria-label="View Settings"
          title="Settings"
        />
      </nav>
    );
  }
}
