import React from 'react';
import Sidebar from './sidebar'

const App = ({ location, children }) => {
    return (
        <div>
            <Sidebar location={ location} />
            <div className="main-panel">
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
