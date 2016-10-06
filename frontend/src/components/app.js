import React, { PureComponent, PropTypes } from 'react';
import Sidebar from './sidebar';

class App extends PureComponent {

    render() {
        return (
          <div className="row">
            <Sidebar location={ this.props.location } />
            <div className="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main-panel">
              <div className="content">
                <div className="container-fluid">
                  { this.props.children }
                </div>
              </div>
            </div>
          </div>
        );
    }
}

App.propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
};

export default App;
