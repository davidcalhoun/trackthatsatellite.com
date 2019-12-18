import React, { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	Redirect,
	useRouteMatch,
	useParams
} from "react-router-dom";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { connect } from "react-redux";
import { tlesToAutocompleteOptions } from "../../utils";
import { path } from "ramda";
import { setSelectedSatellites } from "../../actions";

import styles from "./index.css";

const svgPaths = {
	settings:
		"M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z",
	map:
		"M248 8C111.03 8 0 119.03 0 256s111.03 248 248 248 248-111.03 248-248S384.97 8 248 8zm82.29 357.6c-3.9 3.88-7.99 7.95-11.31 11.28-2.99 3-5.1 6.7-6.17 10.71-1.51 5.66-2.73 11.38-4.77 16.87l-17.39 46.85c-13.76 3-28 4.69-42.65 4.69v-27.38c1.69-12.62-7.64-36.26-22.63-51.25-6-6-9.37-14.14-9.37-22.63v-32.01c0-11.64-6.27-22.34-16.46-27.97-14.37-7.95-34.81-19.06-48.81-26.11-11.48-5.78-22.1-13.14-31.65-21.75l-.8-.72a114.792 114.792 0 0 1-18.06-20.74c-9.38-13.77-24.66-36.42-34.59-51.14 20.47-45.5 57.36-82.04 103.2-101.89l24.01 12.01C203.48 89.74 216 82.01 216 70.11v-11.3c7.99-1.29 16.12-2.11 24.39-2.42l28.3 28.3c6.25 6.25 6.25 16.38 0 22.63L264 112l-10.34 10.34c-3.12 3.12-3.12 8.19 0 11.31l4.69 4.69c3.12 3.12 3.12 8.19 0 11.31l-8 8a8.008 8.008 0 0 1-5.66 2.34h-8.99c-2.08 0-4.08.81-5.58 2.27l-9.92 9.65a8.008 8.008 0 0 0-1.58 9.31l15.59 31.19c2.66 5.32-1.21 11.58-7.15 11.58h-5.64c-1.93 0-3.79-.7-5.24-1.96l-9.28-8.06a16.017 16.017 0 0 0-15.55-3.1l-31.17 10.39a11.95 11.95 0 0 0-8.17 11.34c0 4.53 2.56 8.66 6.61 10.69l11.08 5.54c9.41 4.71 19.79 7.16 30.31 7.16s22.59 27.29 32 32h66.75c8.49 0 16.62 3.37 22.63 9.37l13.69 13.69a30.503 30.503 0 0 1 8.93 21.57 46.536 46.536 0 0 1-13.72 32.98zM417 274.25c-5.79-1.45-10.84-5-14.15-9.97l-17.98-26.97a23.97 23.97 0 0 1 0-26.62l19.59-29.38c2.32-3.47 5.5-6.29 9.24-8.15l12.98-6.49C440.2 193.59 448 223.87 448 256c0 8.67-.74 17.16-1.82 25.54L417 274.25z",
	overheadSatellites:
		"M188.8 345.9l27.4-27.4c2.6.7 5 1.6 7.8 1.6 17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32c0 2.8.9 5.2 1.6 7.8l-27.4 27.4L49.4 206.5c-7.3-7.3-20.1-6.1-25 3-41.8 77.8-29.9 176.7 35.7 242.3 65.6 65.6 164.6 77.5 242.3 35.7 9.2-4.9 10.4-17.7 3-25L188.8 345.9zM209 0c-9.2-.5-17 6.8-17 16v31.6c0 8.5 6.6 15.5 15 15.9 129.4 7 233.4 112 240.9 241.5.5 8.4 7.5 15 15.9 15h32.1c9.2 0 16.5-7.8 16-17C503.4 139.8 372.2 8.6 209 0zm.3 96c-9.3-.7-17.3 6.7-17.3 16.1v32.1c0 8.4 6.5 15.3 14.8 15.9 76.8 6.3 138 68.2 144.9 145.2.8 8.3 7.6 14.7 15.9 14.7h32.2c9.3 0 16.8-8 16.1-17.3-8.4-110.1-96.5-198.2-206.6-206.7z"
};

function SearchBox({ tles, className, selectedSatellites = [], onSelectedSatelliteChange }) {
	const [inputValue, setInputValue] = useState("");

	useEffect(() => {
		const selectedSatName = path([0, 0], selectedSatellites) || "";
		setInputValue(selectedSatName.trim());
	}, selectedSatellites);

	function onInputChange(event, value, reason) {
		const isUserInput = reason === "input";
		if (reason === "input") {
			setInputValue(value);
		}
	}

	return (
		<Autocomplete
			className={className}
			id="satellite-search"
			options={tlesToAutocompleteOptions(tles)}
			loading={Object.keys(tles).length === 0}
			getOptionLabel={option => option.title}
			inputValue={ inputValue }
			style={{}}
			renderInput={params => (
				<TextField
					{...params}
					label="Satellite name (or NORAD/COSPAR)"
					variant="outlined"
					fullWidth
				/>
			)}
			onInputChange={onInputChange}
			onChange={onSelectedSatelliteChange}
		/>
	);
}

function NavIcon(props) {
	const { title, pathD } = props;

	return (
		<svg
			className={styles.navIcon}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 512 512"
		>
			<title>{title}</title>
			<path d={pathD} />
		</svg>
	);
}

function Header({ tles, selectedSatellites, updateSelectedSatellites }) {
	const handleSatelliteChange = (event, options) => {
		if (!options) return;
		const { noradID } = options;
		updateSelectedSatellites([noradID]);
	}

	return (
		<header className={styles.container}>
			<h1 className={styles.title}>Track That Satellite!</h1>
			<nav className={styles.nav}>
				<ul>
					<li>
						<Link to="/map" replace>
							<Button variant="contained" color="primary">
								<NavIcon pathD={svgPaths.map} />
								<span>Map View</span>
							</Button>
						</Link>
					</li>
					<li>
						<Link to="/visible-satellites-overhead" replace>
							<Button variant="contained" color="primary">
								<NavIcon pathD={svgPaths.overheadSatellites} />
								<span>Overhead Satellites view</span>
							</Button>
						</Link>
					</li>
					<li>
						<Link to="/settings" replace>
							<Button variant="contained" color="primary">
								<NavIcon pathD={svgPaths.settings} />
								<span>Settings</span>
							</Button>
						</Link>
					</li>
				</ul>
			</nav>
			<SearchBox
				className={styles.search}
				tles={tles}
				selectedSatellites={selectedSatellites}
				onSelectedSatelliteChange={handleSatelliteChange}
			/>
		</header>
	);
}

const mapStateToProps = (state /*, ownProps*/) => {
	return {
		tles: state.tles.all,
		selectedSatellites: state.tles.selectedSatellites
	};
};

const mapDispatchToProps = dispatch => {
	return {
		updateSelectedSatellites: (noradIDs) => dispatch(setSelectedSatellites(noradIDs))
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
