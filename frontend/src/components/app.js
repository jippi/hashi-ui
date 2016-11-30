import React, { PureComponent, PropTypes } from 'react';
import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
// optional - you can choose the effect you want
import 'react-s-alert/dist/s-alert-css-effects/slide.css';
import 'react-s-alert/dist/s-alert-css-effects/scale.css';
import 'react-s-alert/dist/s-alert-css-effects/bouncyflip.css';
import 'react-s-alert/dist/s-alert-css-effects/flip.css';
import 'react-s-alert/dist/s-alert-css-effects/genie.css';
import 'react-s-alert/dist/s-alert-css-effects/jelly.css';
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css';

import Sidebar from './sidebar';
import Topbar from './topbar';

class App extends PureComponent {

    render() {
        return (
          <div className="wrapper">
            <Sidebar location={ this.props.location } />
            <div className="main-panel">
              <Topbar location={ this.props.location } />
              <Alert stack={{ limit: 2 }} />
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
