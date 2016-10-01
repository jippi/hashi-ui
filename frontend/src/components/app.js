import React from 'react';
import Sidebar from './sidebar'

const App = ({ location, children }) => {
    return (
        <div className="row">
            <Sidebar location={ location} />
            <div className="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main-panel">
                <div className="content">
                    <div className="container-fluid">
                    { children }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
