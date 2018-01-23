import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import { List, ListItem } from "material-ui/List"
import { Card, CardHeader, CardText } from "material-ui/Card"
import { Grid, Row, Col } from "react-flexbox-grid"
import Subheader from "material-ui/Subheader"
import Paper from "material-ui/Paper"
import TextField from "material-ui/TextField"
import {
  CONSUL_GET_SESSION,
  CONSUL_GET_SESSIONS
} from "../sagas/event"

class ConsulSessions extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._onClickSession = this.loadSession.bind(this)
  }

  componentDidMount() {
    this.props.dispatch({ type: CONSUL_GET_SESSIONS });
    if (this.props.routeParams.id) {
      this.props.dispatch({
        type: CONSUL_GET_SESSION,
        payload: this.props.routeParams.id,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.routeParams.id === this.props.routeParams.id) {
      return;
    }
    this.props.dispatch({
      type: CONSUL_GET_SESSION,
      payload: this.props.routeParams.id
    });
  }

  loadSession(id) {
    window.scrollTo(0, document.getElementById("value-pane").offsetTop);
    this.props.router.push({
      pathname: `/consul/${this.props.router.params.region}/sessions/${id}`
    });
  }

  filteredSessions() {
    let sessions = this.props.consulSessions;

    if ("session_name" in this.state) {
      sessions = sessions.filter(session => session.Name.indexOf(this.state.session_name) !== -1)
    }

    return sessions;
  }

  render() {
    let listStyle = {};

    if (window.innerWidth < 1024) {
      listStyle = { maxHeight: 200, overflow: "scroll" };
    }

    return (
      <Grid fluid style={{ padding: 0 }}>
        <Row>
          <Col key="navigation-pane" xs={12} sm={12} md={4} lg={4}>
            <Subheader>Sessions</Subheader>
            <Card>
              <CardHeader title="Filter list" actsAsExpander showExpandableButton />
              <CardText style={{ paddingTop: 0 }} expandable>
                <TextField
                  hintText="Session name"
                  value={this.state.id}
                  onChange={(proxy, value) => {
                    this.setState({ id: value })
                  }}
                />
              </CardText>
            </Card>
            <Paper>
              <List style={listStyle}>
                {this.filteredSessions().map(session => {
                  return (
                    <ListItem
                      key={session.Name}
                      onTouchTap={() => this._onClickSession(session.ID)}
                      primaryText={session.Name}
                    />
                  )
                })}
              </List>
            </Paper>
          </Col>
          <Col id="value-pane" key="value-pane" xs={12} sm={12} md={8} lg={8}>
            <Subheader>
              {this.props.routeParams.id ? `Session: ${this.props.routeParams.id}` : "Please select a session"}
            </Subheader>
            <Card key={`${this.props.consulSession.Name} - ${this.props.consulSession.ID}`} style={{ marginTop: "1em"}}>
              <CardHeader title={`${this.props.consulSession.Name} - ${this.props.consulSession.ID}`} />
            </Card>
          </Col>
        </Row>
      </Grid>
    );
  }
}

function mapStateToProps({ consulSessions, consulSession }) {
  return { consulSessions, consulSession };
}

ConsulSessions.defaultProps = {
  consulSessions: [],
  ConsulSession: {},
};

ConsulSessions.propTypes = {
  dispatch: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  routeParams: PropTypes.object.isRequired,
  consulSessions: PropTypes.array.isRequired,
  consulSession: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(withRouter(ConsulSessions));