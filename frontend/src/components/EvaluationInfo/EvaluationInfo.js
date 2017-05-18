import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Card, CardTitle, CardText } from 'material-ui/Card'
import MetaPayload from '../MetaPayload/MetaPayload'
import EvaluationLink from '../EvaluationLink/EvaluationLink'
import JobLink from '../JobLink/JobLink'

const evaluationProps = [
  'ID',
  'Status',
  'StatusDescription',
  'NextEval',
  'PreviousEval',
  'Priority',
  'Type',
  'JobID',
  'TriggeredBy'
]

class EvaluationInfo extends Component {
  render () {
    const evaluation = this.props.evaluation
    const evalValues = {}

    evaluationProps.map((evalProp) => {
      evalValues[evalProp] = evaluation[evalProp] ? evaluation[evalProp] : '-'
      return null
    })

    evalValues.JobID = <JobLink jobId={ evaluation.JobID } />

    if (evaluation.PreviousEval) {
      evalValues.PreviousEval = <EvaluationLink evaluationId={ evaluation.PreviousEval } />
    }
    if (evaluation.NextEval) {
      evalValues.NextEval = <EvaluationLink evaluationId={ evaluation.NextEval } />
    }

    return (
      <Grid fluid style={{ padding: 0 }}>
        <Row>
          <Col key='properties-pane' xs={ 12 } sm={ 12 } md={ 12 } lg={ 12 }>
            <Card>
              <CardTitle title='Evaluation Properties' />
              <CardText>
                <MetaPayload metaBag={ evalValues } sortKeys={ false } />
              </CardText>
            </Card>
          </Col>
        </Row>
      </Grid>
    )
  }
}


function mapStateToProps ({ evaluation }) {
  return { evaluation }
}

EvaluationInfo.propTypes = {
  evaluation: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(EvaluationInfo)
