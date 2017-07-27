import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Header from '../Header/Header';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as actions from '../../actions';

import { Route, Match } from 'react-router';
import { Switch } from 'react-router-dom';

import { PAGE_PATHS } from '../../config';

import styles from './App.css';

class App extends Component {
  render() {
    const routes = PAGE_PATHS.map(page => {
      let element;
      const isIndex = !!page.index;
      const path = (isIndex) ? '/' : `/${page.path}`;

      return <Route
        exact
        key={path}
        path={path}
        component={() => (<page.component {...this.props} />)
      }/>;
    });

    const temp1 = PAGE_PATHS[0];
    const temp2 = PAGE_PATHS[1];

    return (
      <MuiThemeProvider>
        <div className={styles.container}>
          <Header {...this.props} />
          { /* Workaround: pass location manually (see https://github.com/ReactTraining/react-router/issues/5072) */ }
          <Switch location={this.props.location}>
            {routes}
          </Switch>
        </div>
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  satellites: state.satellites,
  location: state.router.location
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
