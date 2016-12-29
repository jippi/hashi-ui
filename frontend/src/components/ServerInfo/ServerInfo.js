import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Card, CardTitle, CardText } from 'material-ui/Card'
import { TableRow, TableRowColumn } from '../Table'
import TableHelper from '../TableHelper/TableHelper'

const memberProps = [
  'Name',
  'Addr',
  'Port',
  'Status',
]

const ServerInfo = ({ member }) => {
  if (!member) {
    return 'Loading ...';
  }

  const tags = member.Tags

  const memberTags = Object.keys(tags).map((key) => {
    const name = key
    const value = tags[key]

    return (
      <TableRow key={ name }>
        <TableRowColumn>{ name }</TableRowColumn>
        <TableRowColumn>{ value }</TableRowColumn>
      </TableRow>
    )
  })

  return (
    <Grid fluid style={{ padding: 0 }}>
      <Row>
        <Col key='properties-pane' xs={ 12 } sm={ 12 } md={ 6 } lg={ 6 }>
          <Card>
            <CardTitle title='Server Properties' />
            <CardText>
              <dl className='dl-horizontal'>
                { memberProps.map(memberProp =>
                  <div key={ memberProp }>
                    <dt>{ memberProp }</dt>
                    <dd>{ member[memberProp] }</dd>
                  </div>
                  )}
              </dl>
            </CardText>
          </Card>
        </Col>
        <Col key='tags-pane' xs={ 12 } sm={ 12 } md={ 6 } lg={ 6 }>
          <Card>
            <CardTitle title='Server tags' />
            <CardText>
              { (memberTags.length > 0)
                ? <TableHelper headers={ ['Name', 'Value'] } body={ memberTags } />
                : null
              }
            </CardText>
          </Card>
        </Col>
      </Row>
    </Grid>
  )
}

function mapStateToProps ({ member }) {
  return { member }
}

ServerInfo.propTypes = {
  member: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(ServerInfo)
