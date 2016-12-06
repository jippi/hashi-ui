import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

const evaluationProps = [
  'ID',
  'Status',
  'Priority',
  'Type',
  'JobID',
  'TriggeredBy'
]

const EvaluationInfo = ({ evaluation }) =>
  <div className='tab-pane active'>
    <div className='row'>
      <div className='col-lg-6 col-md-6 col-sm-6 col-sx-6 tab-column'>
        <legend>Evaluation Properties</legend>
        <dl className='dl-horizontal'>
          { evaluationProps.map(evalProp =>
            <div key={ evalProp }>
              <dt>{ evalProp }</dt>
              <dd>{ evaluation[evalProp] }</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  </div>

function mapStateToProps ({ evaluation }) {
  return { evaluation }
}

EvaluationInfo.propTypes = {
  evaluation: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(EvaluationInfo)
