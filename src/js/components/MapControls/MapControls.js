import React, { Component, PropTypes } from 'react';
import Switch from 'material-ui/Switch';
import Button from 'material-ui/Button';
import littleTime from 'little-time';

import styles from './MapControls.css';

export default class MapControls extends Component {
  constructor(props) {
    super(props);

    [
      'handle3DToggle',
      'handleSatelliteToggle',
      'handleTimeSliderChange',
      'handleMinus',
      'handlePlus'
    ].forEach(fn => this[fn] = this[fn].bind(this));
  }

  handle3DToggle() {
    this.props.actions.toggleMap3DView(this.props.satellite);
  }

  handleSatelliteToggle() {
    this.props.actions.toggleMapSatelliteView();
  }

  handleTimeSliderChange(e) {
    this.props.actions.setUserTime(e.target.value);
  }

  handleMinus() {
    const userTimestampOverride = this.props.user.timestampOverride;
    const timestamp = (userTimestampOverride) ? userTimestampOverride : Date.now();
    const timestampAdjusted = timestamp - 10000;
    this.props.actions.setUserTimeMS(timestampAdjusted);
  }

  handlePlus() {
    const userTimestampOverride = this.props.user.timestampOverride;
    const timestamp = (userTimestampOverride) ? userTimestampOverride : Date.now();
    const timestampAdjusted = timestamp + 10000;
    this.props.actions.setUserTimeMS(timestampAdjusted);
  }

  render() {
    const userTimestampOverride = this.props.user.timestampOverride;
    const timestamp = (userTimestampOverride) ? userTimestampOverride : Date.now();
    const userTime = littleTime(timestamp).format('ddd MMM Do YYYY HH:mm:ss');

    return (
      <div className={styles.container}>
        <label htmlFor={styles.toggleThreed}>3D</label>
        <Switch id={styles.toggle} onChange={this.handle3DToggle} />
        <label htmlFor={styles.toggleSatellite}>Satellite</label>
        <Switch id={styles.toggleSatellite} onChange={this.handleSatelliteToggle} />
        <label htmlFor={styles.timeSlider}>Time</label>
        <Button
          raised
          className={styles.minus}
          onClick={this.handleMinus}
        >
          -10 sec
        </Button>
        <input
          id={styles.timeSlider}
          type="range"
          min="0"
          max="500"
          defaultValue={this.props.user.timeSliderVal}
          onChange={this.handleTimeSliderChange}
        />
        <Button
          raised
          className={styles.plus}
          onClick={this.handlePlus}
        >
          +10 sec
        </Button>
        <span>{userTime}</span>
      </div>
    );
  }
}