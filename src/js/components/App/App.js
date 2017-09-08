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
import stations from '../../tles/stations.txt';

import styles from './App.css';

class App extends Component {
  constructor() {
    super();
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

    const satellites = stations.split('\n');
    const satellitesArr = R.splitEvery(3, satellites);
    this.props.actions.setSatellites(satellitesArr);
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
