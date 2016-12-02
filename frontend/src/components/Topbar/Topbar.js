import React, { PureComponent } from 'react';

class Topbar extends PureComponent {

    /* eslint class-methods-use-this: 0*/
  onClick() {
    window.document.querySelector('html').classList.toggle('nav-open');
  }

  render() {
    return (
      <nav className="navbar navbar-default hidden-md hidden-lg">
        <div className="container-fluid">
          <div className="navbar-minimize">
            <button id="minimizeSidebar" className="btn btn-warning btn-fill btn-round btn-icon">
              <i className="fa fa-ellipsis-v visible-on-sidebar-regular"></i>
              <i className="fa fa-navicon visible-on-sidebar-mini"></i>
            </button>
          </div>
          <div className="navbar-header">
            <button type="button" onClick={ this.onClick } className="navbar-toggle" data-toggle="collapse">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand" href="/">Nomad UI</a>
          </div>
        </div>
      </nav>
    );
  }
}

// Topbar.propTypes = {
//     location: PropTypes.object.isRequired,
// };

export default Topbar;
