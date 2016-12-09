import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Card, CardTitle, CardText } from 'material-ui/Card'
import RawJson from '../RawJson/RawJson'

const AllocationRaw = ({ allocation }) =>
  <Card>
    <CardTitle title='Raw allocation data' />
    <CardText>
      <RawJson json={ allocation } />
    </CardText>
  </Card>

function mapStateToProps ({ allocation }) {
  return { allocation }
}

AllocationRaw.propTypes = {
  allocation: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(AllocationRaw)
