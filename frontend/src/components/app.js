import React, { PureComponent, PropTypes } from 'react';
import Sidebar from './sidebar';
import Topbar from './topbar';

class App extends PureComponent {

    render() {
        return (
          <div className="wrapper">
            <Sidebar location={ this.props.location } />
            <div className="main-panel">
              <Topbar location={ this.props.location } />
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
