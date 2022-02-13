import React, { Fragment, useEffect } from "react";
import { connect } from 'react-redux';
import { VisibleSatellitesProjection } from "react-hook-visible-satellites";
import { siteName } from "../consts";
import { UPDATE_VIEW, fetchGeolocation, fetchAllTLEs } from "../actions";
import { getNORADSatNum } from "../utils";

function VisibleSatellites(props) {
	const { fetchLocation, position, tles, fetchTLEs, tlesFetching, tlesFailed } = props;

	function init() {
		document.title = `Overhead Satellites - ${ siteName }`;

		props.updateView("overhead");

		if (!position) {
			fetchLocation();
		}

		if (Object.keys(tles).length === 0 && !tlesFetching && !tlesFailed) {
			fetchTLEs();
		}
	}
	useEffect(init, []);

	if (tlesFailed) {
		console.error(`Failed to fetch TLEs`, tlesFailed);
	}

	return (
		<Fragment>
			<VisibleSatellitesProjection
				lat="32.9713669"
				lng="-80.0186873"
				tles={tles}
				style={ {height: "100vh", width: "100vw"} }
			/>
		</Fragment>
	);
}

const mapStateToProps = (state /*, ownProps*/) => {
	return {
		currentView: state.view.currentView,
		position: state.geolocation.position,
		tles: state.tles.allRaw,
		tlesFetching: state.tles.isFetching,
		tlesFailed: state.tles.error
	};
}

const mapDispatchToProps = dispatch => {
	return {
		fetchLocation: () => dispatch(fetchGeolocation()),
		updateView: view => dispatch({ type: UPDATE_VIEW, view }),
		fetchTLEs: options => dispatch(fetchAllTLEs(options))
	};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VisibleSatellites);
