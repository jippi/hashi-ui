import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Helmet } from "react-helmet"
import { Card, CardText } from "material-ui/Card"
const green500 = green['500'];
import FontIcon from "material-ui/FontIcon"
import { NOMAD_WATCH_MEMBERS, NOMAD_UNWATCH_MEMBERS } from "../sagas/event"
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "../components/Table"
import ServerLink from "../components/ServerLink/ServerLink"

import { green } from '@material-ui/core/colors';

class Servers extends Component {
  componentDidMount() {
    this.props.dispatch({ type: NOMAD_WATCH_MEMBERS })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: NOMAD_UNWATCH_MEMBERS })
  }

  showLeaderIcon(member) {
    if (!member.Leader) {
      return null
    }

    return (
      <FontIcon className="material-icons" style={{ color: green500 }}>
        check
      </FontIcon>
    )
  }

  render() {
    return (
      <span>
        <Helmet>
          <title>Servers - Nomad - Hashi-UI</title>
        </Helmet>
        <Card>
          <CardText>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderColumn>Name</TableHeaderColumn>
                  <TableHeaderColumn>Address</TableHeaderColumn>
                  <TableHeaderColumn>Port</TableHeaderColumn>
                  <TableHeaderColumn>Region</TableHeaderColumn>
                  <TableHeaderColumn>Datacenter</TableHeaderColumn>
                  <TableHeaderColumn>Status</TableHeaderColumn>
                  <TableHeaderColumn>Leader</TableHeaderColumn>
                  <TableHeaderColumn>Protocol</TableHeaderColumn>
                  <TableHeaderColumn>Build</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody>
                {this.props.members.map(member => {
                  return (
                    <TableRow key={member.Name}>
                      <TableRowColumn>
                        <ServerLink serverId={member.Name} />
                      </TableRowColumn>
                      <TableRowColumn>
                        {member.Addr}
                      </TableRowColumn>
                      <TableRowColumn>
                        {member.Port}
                      </TableRowColumn>
                      <TableRowColumn>
                        {member.Tags.region}
                      </TableRowColumn>
                      <TableRowColumn>
                        {member.Tags.dc}
                      </TableRowColumn>
                      <TableRowColumn>
                        {member.Status}
                      </TableRowColumn>
                      <TableRowColumn>
                        {this.showLeaderIcon(member)}
                      </TableRowColumn>
                      <TableRowColumn>
                        {member.ProtocolCur}
                      </TableRowColumn>
                      <TableRowColumn>
                        {member.Tags.build}
                      </TableRowColumn>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardText>
        </Card>
      </span>
    )
  }
}

function mapStateToProps({ members }) {
  return { members }
}

Servers.propTypes = {
  members: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(Servers)
