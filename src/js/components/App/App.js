import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Header from '../Header/Header';
import R from 'ramda';
import * as actions from '../../actions';

import { Route, Match } from 'react-router';
import { Switch } from 'react-router-dom';

import MapView from '../../pages/MapView/MapView';

import { PAGE_PATHS } from '../../config';
import issTLE from '../../tles/_iss.txt';

import styles from './App.css';

const tlesPath = '/data/tles.txt';

class App extends Component {
  constructor(props) {
    super(props);

    [
      'fetchAllTLEs',
      'processRawTLEs'
    ].forEach(fn => this[fn] = this[fn].bind(this));
  }

  fetchAllTLEs(path) {
    fetch(path)
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response;
      } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
      }
    })
    .then(response => response.text())
    .then(rawTLEs => this.processRawTLEs(rawTLEs))
    .catch(error => console.log('request failed', error));
  }

  processRawTLEs(rawText) {
    const arr = rawText.split('\n');
    const groupedArr = R.splitEvery(3, arr);

    this.props.actions.setSatellites(groupedArr);
  }

  /**
   * Connects routes to redux, allowing the result of reducers to be passed into each page.
   */
  reduxifyRoutes() {
    this.header = connect(
      mapStateToProps,
      mapDispatchToProps)(Header);

    this.routes = PAGE_PATHS.map(page => {
      const isIndex = !!page.index;
      const path = (isIndex) ? '/' : `/${page.path}`;

      /**
       * Connects each component to redux.
       * Workaround for https://github.com/ReactTraining/react-router/issues/5072
       */
      const connectedComponent = connect(
        mapStateToProps,
        mapDispatchToProps
      )(page.component);

      const route = <Route
        exact
        key={path}
        path={path}
        component={connectedComponent}
      />;

      return route;
    });
  }

  componentWillMount() {
    this.reduxifyRoutes();

    // Async - fetch all tles.
    this.fetchAllTLEs(tlesPath);

    // Fill initial satellite list with ISS (International Space Station).
    // Other TLEs will come in async later.
    this.processRawTLEs(issTLE);
  }

  render() {
    return (
      <div className={styles.container}>
        <this.header {...this.props} />
        <Switch location={this.props.location}>
          {this.routes}
        </Switch>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  location: state.router.location,
  map: state.map,
  satellite: state.satellite,
  satellites: state.satellites,
  user: state.user
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
