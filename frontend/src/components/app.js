import React, { PropTypes } from 'react';
import Sidebar from './sidebar';

const App = ({ location, children }) =>
  <div>
    <Sidebar location={ location } />
    <div className="main-panel">
      <div className="content">
        <div className="container-fluid">
          { children }
        </div>
      </div>
    </div>
  </div>;

App.propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
};

export default App;
