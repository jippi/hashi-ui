import React, { Component, PropTypes } from 'react';
import { ProgressBar } from 'react-bootstrap';

class Progressbar extends Component {

  colorIndex(index) {
    return {
            // client status
      ready: 'success',
      initializing: 'warning',
      down: 'danger',

            // server status
      alive: 'success',
      leaving: 'warning',
      left: 'danger',
      shutdown: 'danger',

            // job status
      running: 'success',
      pending: 'warning',
      dead: 'info',

            // job type
      service: 'success',
      batch: 'info',
      system: 'primary',

            // task states
            // running: 'success',
      starting: 'warning',
      queued: 'info',
      failed: 'danger',
      lost: 'danger',
    }[index];
  }

  render() {
    const keys = Object.keys(this.props.data);
    const normalizedValues = {};
    keys.forEach(key => (normalizedValues[key.toLowerCase()] = this.props.data[key]));
    const normalizedKeys = keys.map(string => string.toLowerCase());
    const sum = normalizedKeys.reduce((previous, currentValue) => {
      return previous + normalizedValues[currentValue];
    }, 0);

    return (
      <div className="card">
        <div className="content">
          <h5>{ this.props.title }</h5>

          <ProgressBar>
            {normalizedKeys.map((index) => {
              return (
                <ProgressBar
                  bsStyle={ this.colorIndex(index) }
                  min={ 0 }
                  max={ sum }
                  now={ normalizedValues[index] }
                  key={ index }
                />
              );
            })}
          </ProgressBar>

          {normalizedKeys.map((index) => {
            return (
              <span style={{ paddingRight: '10px' }} key={ index }>
                <i className={ `fa fa-circle text-${this.colorIndex(index)}` }></i>
                { index } ({ normalizedValues[index] })
                    </span>
            );
          })}
        </div>
      </div>
    );
  }
}

Progressbar.propTypes = {
  data: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
};

export default Progressbar;
