import React, { Component, PropTypes } from 'react';
import { ProgressBar } from 'react-bootstrap';

class Progressbar extends Component {

    colorIndex(index) {
        return ['success', 'warning', 'info', 'danger'][index];
    }

    render() {
        const keys = Object.keys(this.props.data);
        const sum = keys.reduce((previous, currentValue) => {
            return previous + this.props.data[currentValue];
        }, 0);

        let numIndex = 0;
        let labelIndex = 0;

        return (
          <div className="card">
            <div className="content">
              <h5>{ this.props.title }</h5>
              <ProgressBar>
                {keys.map((index) => {
                    return (
                      <ProgressBar
                        bsStyle={ this.colorIndex(numIndex++) }
                        min={ 0 }
                        max={ sum }
                        now={ this.props.data[index] }
                        key={ index }
                      />
                  );
                })}
              </ProgressBar>

              <div>
                {keys.map((index) => {
                    return (
                      <span style={{ paddingRight: '10px' }} key={ index }>
                        <i className={ `fa fa-circle text-${this.colorIndex(labelIndex++)}` }></i>
                        { index } ({ this.props.data[index] })
                      </span>
                    );
                })}
              </div>
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
