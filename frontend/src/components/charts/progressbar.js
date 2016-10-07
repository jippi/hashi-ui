import React, { Component, PropTypes } from 'react';
import { ProgressBar } from 'react-bootstrap';

class Progressbar extends Component {

    colorIndex(index) {
        return {
            // client status
            ready: 'success',
            initialializing: 'warning',
            down: 'danger',

            // server status
            alive: 'success',
            leavning: 'warning',
            left: 'danger',
            shutdown: 'danger',

            // job status
            running: 'success',
            pending: 'warning',
            dead: 'danger',

            // job type
            service: 'success',
            batch: 'info',
            system: 'warning',

            // task states
            Running: 'success',
            Starting: 'warning',
            Queued: 'info',
            Failed: 'danger',
            Lost: 'danger',
        }[index];
    }

    render() {
        const keys = Object.keys(this.props.data);
        const sum = keys.reduce((previous, currentValue) => {
            return previous + this.props.data[currentValue];
        }, 0);

        return (
          <div className="card">
            <div className="content">
              <h5>{ this.props.title }</h5>
              <ProgressBar>
                {keys.map((index) => {
                    return (
                      <ProgressBar
                        bsStyle={ this.colorIndex(index) }
                        min={ 0 }
                        max={ sum }
                        now={ this.props.data[index] }
                        key={ index }
                      />
                  );
                })}
              </ProgressBar>

              {keys.map((index) => {
                  return (
                    <span style={{ paddingRight: '10px' }} key={ index }>
                      <i className={ `fa fa-circle text-${this.colorIndex(index)}` }></i>
                      { index } ({ this.props.data[index] })
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
