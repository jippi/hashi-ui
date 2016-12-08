import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Card, CardTitle, CardText } from 'material-ui/Card'

const evaluationProps = [
  'ID',
  'Status',
  'Priority',
  'Type',
  'JobID',
  'TriggeredBy'
]

const EvaluationInfo = ({ evaluation }) =>
  <Grid fluid style={{ padding: 0 }}>
    <Row>
      <Col key='properties-pane' xs={ 12 } sm={ 12 } md={ 12 } lg={ 12 }>
        <Card>
          <CardTitle title='Client Properties' />
          <CardText>
            <dl className='dl-horizontal'>
              { evaluationProps.map(evalProp =>
                <div key={ evalProp }>
                  <dt>{ evalProp }</dt>
                  <dd>{ evaluation[evalProp] }</dd>
                </div>
              )}
            </dl>
          </CardText>
        </Card>
      </Col>
    </Row>
  </Grid>


function mapStateToProps ({ evaluation }) {
  return { evaluation }
}

EvaluationInfo.propTypes = {
  evaluation: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(EvaluationInfo)
