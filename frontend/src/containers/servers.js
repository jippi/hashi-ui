import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Card, CardText } from 'material-ui/Card'
import { green500 } from 'material-ui/styles/colors'
import FontIcon from 'material-ui/FontIcon'
import { WATCH_MEMBERS, UNWATCH_MEMBERS } from '../sagas/event'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from '../components/Table'
import ServerLink from '../components/ServerLink/ServerLink'

class Servers extends Component {

  componentDidMount() {
    this.props.dispatch({ type: WATCH_MEMBERS })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: UNWATCH_MEMBERS })
  }

  showLeaderIcon(member) {
    if (!member.Leader) {
      return null
    }

    return <FontIcon className='material-icons' style={{ color: green500 }}>check</FontIcon>
  }

  render() {
    return (
      <div>
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
                { this.props.members.map((member) => {
                  return (
                    <TableRow key={ member.ID }>
                      <TableRowColumn><ServerLink serverId={ member.Name } /></TableRowColumn>
                      <TableRowColumn>{ member.Addr }</TableRowColumn>
                      <TableRowColumn>{ member.Port }</TableRowColumn>
                      <TableRowColumn>{ member.Tags.region }</TableRowColumn>
                      <TableRowColumn>{ member.Tags.dc }</TableRowColumn>
                      <TableRowColumn>{ member.Status }</TableRowColumn>
                      <TableRowColumn>{ this.showLeaderIcon(member) }</TableRowColumn>
                      <TableRowColumn>{ member.ProtocolCur }</TableRowColumn>
                      <TableRowColumn>{ member.Tags.build }</TableRowColumn>
                    </TableRow>
                  )
                })
              }
              </TableBody>
            </Table>
          </CardText>
        </Card>
      </div>
    )
  }
}

function mapStateToProps ({ members }) {
  return { members }
}

Servers.propTypes = {
  members: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
}

export default connect(mapStateToProps)(Servers)
