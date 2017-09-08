import Downshift from 'downshift';
import R from 'ramda';
import React, { Component, PropTypes } from 'react';

import styles from './SatelliteInput.css';

function BasicAutocomplete({items, onChange, defaultInputValue, className, value}) {
  return (
    <Downshift onChange={onChange} defaultInputValue={defaultInputValue}>
      {({
        getInputProps,
        getItemProps,
        isOpen,
        inputValue,
        selectedItem,
        highlightedIndex
      }) => (
        <div className={className}>
          <input {...getInputProps({placeholder: 'Satellite Name'})} />
          {isOpen ? (
            <div className={styles.dropdown}>
              {items
                .filter(
                  i =>
                    !inputValue ||
                    i.toLowerCase().includes(inputValue.toLowerCase()),
                )
                .map((item, index) => (
                  <div
                    {...getItemProps({item})}
                    key={index}
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
      'handleChange'
    ].forEach(fn => {
      if (typeof this[fn] !== 'function') {
        console.warn(`constructor error: could not find function ${fn}`);
        return;
      }

      this[fn] = this[fn].bind(this)
    });
  }

  componentWillMount() {

  }

  componentDidMount() {
    const defaultSatelliteStr = 'ISS (ZARYA) (25544)';
    this.handleChange(defaultSatelliteStr);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.satellite.name !== this.props.satellite.name) {
      this.setState({ autocompleteText: nextProps.satellite.name });
    }
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
        className={this.props.className || styles.container}
        defaultInputValue={this.props.satellite.name}
      />
    );
  }
}