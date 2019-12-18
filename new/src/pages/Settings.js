import React, { Fragment, useEffect } from "react";
import { connect } from 'react-redux';

import { siteName } from "../consts";
import { UPDATE_VIEW } from "../actions";

function Settings(props) {
	useEffect(() => {
		document.title = `Settings - ${ siteName }`;

		props.updateView("settings");
	})

	return (
    <Fragment>
      <h2>Settings</h2>
      <p>Coming soon...</p>
    </Fragment>
  );
}

const mapStateToProps = (state /*, ownProps*/) => {
  return {
    currentView: state.view.currentView
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateView: view => dispatch({ type: UPDATE_VIEW, view })
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);

