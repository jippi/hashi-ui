import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import RawJson from '../RawJson/RawJson'

const EvaluationRaw = ({ evaluation }) =>
  <div className='tab-pane active'>
    <RawJson json={ evaluation } />
  </div>

function mapStateToProps ({ evaluation }) {
  return { evaluation }
}

EvaluationRaw.propTypes = {
  evaluation: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(EvaluationRaw)
