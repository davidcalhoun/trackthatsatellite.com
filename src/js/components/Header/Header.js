import React, { Component, PropTypes } from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import stations from '../../tles/stations.txt';
import R from 'ramda';
import AutoComplete from 'react-autosuggest';

import styles from './Header.css';

export default class Header extends Component {
  constructor() {
    super();

    const stationsArr = stations.split('\n');
    this.stations = R.splitEvery(3, stationsArr);
    this.stationNames = this.stations.map(tle => {return {label: tle[0]}});

    this.state = {
      satelliteAutoCompleteSuggestions: []
    };

    [
      'handleNewRequest',
      'handleUpdateInput',
      'handleSuggestionsClearRequested',
      'handleSuggestionsFetchRequested',
      'getSuggestionValue',
      'renderSuggestionsContainer'
    ].forEach(fn => this[fn] = this[fn].bind(this));
  }

  componentWillMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  handleUpdateInput(value) {
    this.setState({
      satelliteAutoCompleteSuggestions: [
        value,
        value + value,
        value + value + value,
      ],
    });
  }

  handleNewRequest(value) {
    console.log(222, value)
  }

  getSuggestionValue(suggestion) {
    return suggestion.label;
  }

  renderSuggestionsContainer() {
    const { containerProps, children } = options;

    return (
      <Paper {...containerProps} square>
        {children}
      </Paper>
    );
  }

  handleSuggestionsFetchRequested({ value }) {
    this.setState({
      satelliteAutoCompleteSuggestions: getSuggestions(value),
    });
  }

  handleSuggestionsClearRequested() {
    this.setState({
      satelliteAutoCompleteSuggestions: [],
    });
  }

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