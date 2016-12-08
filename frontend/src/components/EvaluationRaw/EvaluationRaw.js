import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Card, CardTitle, CardText } from 'material-ui/Card'
import RawJson from '../RawJson/RawJson'

const EvaluationRaw = ({ evaluation }) =>
  <Card>
    <CardTitle title='Raw evaluation data' />
    <CardText>
      <RawJson json={ evaluation } />
    </CardText>
  </Card>

function mapStateToProps ({ evaluation }) {
  return { evaluation }
}

EvaluationRaw.propTypes = {
  evaluation: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(EvaluationRaw)
