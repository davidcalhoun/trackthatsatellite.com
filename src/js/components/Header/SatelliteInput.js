import Downshift from 'downshift';
import React, { Component, PropTypes } from 'react';

import styles from './SatelliteInput.css';

const placeholderText = 'Satellite name/id';

function BasicAutocomplete({items, onChange, onClick, onBlur, defaultInputValue}) {
  return (
    <Downshift
      onChange={onChange}
      defaultInputValue={defaultInputValue}
    >
      {({
        getInputProps,
        getItemProps,
        isOpen,
        inputValue,
        selectedItem,
        highlightedIndex
      }) => (
        <div className={styles.container}>
          <input
            className={styles.input}
            {...getInputProps({
              placeholder: placeholderText,
              onClick,
              onBlur
            })}
          />
          {isOpen ? (
            <div className={styles.dropdown} style={{border: '1px solid #ccc'}}>
              {items
                .filter(
                  i =>
                    !inputValue ||
                    i.toLowerCase().includes(inputValue.toLowerCase()),
                )
                .map((item, index) => (
                  <div
                    {...getItemProps({item})}
                    key={item}
                    style={{
                      backgroundColor:
                        highlightedIndex === index ? 'gray' : 'white',
                      fontWeight: selectedItem === item ? 'bold' : 'normal',
                    }}
                  >
                    {item}
                  </div>
                ))}
            </div>
          ) : null}
        </div>
      )}
    </Downshift>
  )
}

export default class SatelliteInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false
    };

    [
      'handleChange',
      'handleClick',
      'handleBlur'
    ].forEach(fn => {
      if (typeof this[fn] !== 'function') {
        console.warn(`constructor error: could not find function ${fn}`);
        return;
      }

      this[fn] = this[fn].bind(this)
    });
  }

  componentDidMount() {
    const defaultSatelliteStr = 'ISS (ZARYA) (25544)';

    // User arrived at base path, so redirect to ISS path.
    if (!this.getURLQueryParam('satellite')) {
      this.handleChange(defaultSatelliteStr);
    }
  }

  toURLFriendlyStr(str) {
    return str.replace(/\s/gi, '-').replace(/\(|\)/gi, '').toLowerCase();
  }

  getSatelliteFromURL(pathname) {
    const splitPathname = window.location.pathname.split('-');
    const lastPart = splitPathname[splitPathname.length - 1];
    const intLastPart = +lastPart;
    const isInt = Number.isInteger(intLastPart);

    console.log(444, isInt, lastPart)
  }

  getURLQueryParam(param, search = window.location.search) {
    const minusQuestionMark = search.replace('?', '');
    const splitParams = minusQuestionMark.split('&');
    const keyVals = splitParams.map(keyval => {
      const keyvalSplit = keyval.split('=');
      return {
        key: keyvalSplit[0],
        val: keyvalSplit[1]
      };
    });

    const filteredKeyVals = keyVals.filter(keyval => keyval.key === param);

    return (filteredKeyVals[0] && filteredKeyVals[0].val) || null;
  }

  getSatelliteID(str) {
    const split = str.split('-');
    const lastVal = split[split.length - 1];
    return parseInt(lastVal);
  }

  getFullSatelliteNameFromID(id, props = this.props) {
    const matches = props.satellites.names.filter(name => name.match(id));

    return matches[0] || '';
  }

  componentWillReceiveProps(nextProps) {
    const urlSatelliteQuery = this.getURLQueryParam('satellite');
    const satelliteURLFriendly = this.toURLFriendlyStr(nextProps.satellite.name);
    const satelliteMatchesURL = urlSatelliteQuery && (urlSatelliteQuery === satelliteURLFriendly);
    const satelliteListMatch = this.doArraysMatchQuick(this.props.satellites.names, nextProps.satellites.names);
    const satelliteMissingTLE = !this.props.satellite.tle;

    if ((!satelliteMatchesURL || satelliteMissingTLE) && !satelliteListMatch) {
      const urlSatelliteID = this.getSatelliteID(urlSatelliteQuery);
      const urlSatelliteStr = this.getFullSatelliteNameFromID(urlSatelliteID, nextProps);
      this.props.actions.setSatelliteTLE(urlSatelliteStr, nextProps.satellites.tles);
    }
  }

  doArraysMatchQuick(arr1 = [], arr2 = []) {
    return arr1.length === arr2.length;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const satelliteNameMatch = this.props.satellite.name === nextProps.satellite.name;
    const satelliteListMatch = this.doArraysMatchQuick(this.props.satellites.names, nextProps.satellites.names);

    return !(satelliteNameMatch && satelliteListMatch);
  }

  /**
   * Handles errors in the component subtree.
   */
  componentDidCatch(error, info) {
    this.setState({ hasError: true });
    console.warn(error, info);
  }

  handleChange(selectedItem) {
    this.props.actions.setSatelliteTLE(selectedItem, this.props.satellites.tles);

    const satellite = this.toURLFriendlyStr(selectedItem);
    this.props.history.replace({
      pathname: this.props.history.location.pathname,
      search: `?satellite=${satellite}`
    });
  }

  handleClick(evt) {
    this.prevValue = evt.target.value;
    evt.target.value = '';
  }

  handleBlur(evt) {
    const shouldRestorePrevValue = evt.target.value === '';

    if (shouldRestorePrevValue) {
      evt.target.value = this.prevValue || this.props.satellite.name
    }
  }

  render() {
    if (this.state.hasError) {
      return (<div><h1>Error in SatelliteInput</h1></div>)
    }

    if (!this.props.satellite.name) return (<div></div>);

    return (
      <BasicAutocomplete
        items={this.props.satellites.names}
        onChange={this.handleChange}
        onClick={this.handleClick}
        onBlur={this.handleBlur}
        className={this.props.className || styles.container}
        defaultInputValue={this.props.satellite.name}
      />
    );
  }
}