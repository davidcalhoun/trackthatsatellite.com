import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Header from '../Header/Header';
import createMuiTheme from 'material-ui/styles/theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as actions from '../../actions';

import { Route, Match } from 'react-router';
import { Switch } from 'react-router-dom';

import MapView from '../../pages/MapView/MapView';

import { PAGE_PATHS } from '../../config';

import styles from './App.css';

const theme = createMuiTheme();

class App extends Component {
  constructor() {
    super();
  }

  componentWillMount() {
    this.routes = PAGE_PATHS.map(page => {
      let element;
      const isIndex = !!page.index;
      const path = (isIndex) ? '/' : `/${page.path}`;

      // Workaround (see https://github.com/ReactTraining/react-router/issues/5072)
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

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div className={styles.container}>
          <Header {...this.props} />
          <Switch location={this.props.location}>
            {this.routes}
          </Switch>
        </div>
      </MuiThemeProvider>
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
