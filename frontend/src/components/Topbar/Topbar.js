import React, { PureComponent } from 'react';
import AppBar from 'material-ui/AppBar';
import { Link, withRouter } from 'react-router';
import {Tabs, Tab} from 'material-ui/Tabs';
import Slider from 'material-ui/Slider';

class Topbar extends PureComponent {

  handleActive = (tab) => {
    this.props.router.push(tab.props['data-route']);
  }

  getActiveTab = () => {
    const location = this.props.location;

    if (location.pathname.startsWith('/cluster')) {
      return 'cluster';
    }

    if (location.pathname.startsWith('/jobs')) {
      return 'jobs';
    }

    if (location.pathname.startsWith('/allocations')) {
      return 'allocations';
    }

    if (location.pathname.startsWith('/evaluations')) {
      return 'evaluations';
    }

    if (location.pathname.startsWith('/clients')) {
      return 'clients';
    }

    if (location.pathname.startsWith('/servers')) {
      return 'servers';
    }

    return 'cluster'
  }

  render() {
    return (
      <div>
        <AppBar title="Nomad UI" showMenuIconButton={ false }></AppBar>
        <Tabs value={ this.getActiveTab() }>
          <Tab label="Cluster" value="cluster" data-route="/cluster" onActive={ this.handleActive } />
          <Tab label="Jobs" value="jobs" data-route="/jobs" onActive={ this.handleActive } />
          <Tab label="Allocations" value="allocations" data-route="/allocations" onActive={ this.handleActive } />
          <Tab label="Evaluations" value="evaluations" data-route="/evaluations" onActive={ this.handleActive } />
          <Tab label="Clients" value="clients" data-route="/clients" onActive={ this.handleActive } />
          <Tab label="Servers" value="servers" data-route="/servers" onActive={ this.handleActive } />
        </Tabs>
      </div>
    );
  }
}

const TopbarWithRouter = withRouter(Topbar);

export default TopbarWithRouter;
