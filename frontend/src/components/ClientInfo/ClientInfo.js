import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import MetaPayload from '../MetaPayload/MetaPayload'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Card, CardTitle, CardText } from 'material-ui/Card'

const nodeProps = [
  'ID',
  'Name',
  'Status',
  'Datacenter',
  'Drain',
  'HTTPAddr',
  'NodeClass'
]

const withPrefix = function withPrefix (obj, prefix) {
  const result = {}

  Object.keys(obj || {}).forEach((key) => {
    if (key.startsWith(prefix)) {
      result[key.replace(prefix, '')] = obj[key]
    }
  })

  return result
}

const ClientInfo = ({ node }) =>
  <Grid fluid style={{ padding: 0 }}>
    <Row>
      <Col key='properties-pane' xs={ 12 } sm={ 12 } md={ 6 } lg={ 6 }>
        <Card>
          <CardTitle title='Client Properties' />
          <CardText>
            <dl className='dl-horizontal'>
              { nodeProps.map(nodeProp =>
                <div key={ nodeProp }>
                  <dt>{ nodeProp }</dt>
                  <dd>{ node[nodeProp] }</dd>
                </div>
              )}
            </dl>
          </CardText>
        </Card>
      </Col>
      <Col key='meta-pane' xs={ 12 } sm={ 12 } md={ 6 } lg={ 6 }>
        <Card>
          <CardTitle title='Meta Properties' />
          <CardText>
            <MetaPayload dtWithClass='wide' metaBag={ node.Meta } />
          </CardText>
        </Card>
      </Col>
    </Row>
    <Row style={{ marginTop: '1rem' }}>
      <Col key='cpu-pane' xs={ 12 } sm={ 12 } md={ 6 } lg={ 6 }>
        <Card>
          <CardTitle title='CPU Properties' />
          <CardText>
            <MetaPayload dtWithClass='wide' metaBag={ withPrefix(node.Attributes, 'cpu.') } />
          </CardText>
        </Card>
      </Col>
      <Col key='driver-pane' xs={ 12 } sm={ 12 } md={ 6 } lg={ 6 }>
        <Card>
          <CardTitle title='Driver Properties' />
          <CardText>
            <MetaPayload dtWithClass='wide' metaBag={ withPrefix(node.Attributes, 'driver.') } />
          </CardText>
        </Card>
      </Col>
    </Row>
    <Row style={{ marginTop: '1rem' }}>
      <Col key='kernel-pane' xs={ 12 } sm={ 12 } md={ 6 } lg={ 6 }>
        <Card>
          <CardTitle title='Kernel Properties' />
          <CardText>
            <MetaPayload dtWithClass='wide' metaBag={ withPrefix(node.Attributes, 'kernel.') } />
          </CardText>
        </Card>
      </Col>
      <Col key='unique-pane' xs={ 12 } sm={ 12 } md={ 6 } lg={ 6 }>
        <Card>
          <CardTitle title='Unique Properties' />
          <CardText>
            <MetaPayload dtWithClass='wide' metaBag={ withPrefix(node.Attributes, 'unique.') } />
          </CardText>
        </Card>
      </Col>
    </Row>
    <Row style={{ marginTop: '1rem' }}>
      <Col key='unique-pane' xs={ 12 } sm={ 12 } md={ 6 } lg={ 6 }>
        <Card>
          <CardTitle title='Nomad Properties' />
          <CardText>
            <MetaPayload dtWithClass='wide' metaBag={ withPrefix(node.Attributes, 'nomad.') } />
          </CardText>
        </Card>
      </Col>
    </Row>
  </Grid>

function mapStateToProps ({ node }) {
  return { node }
}

ClientInfo.propTypes = {
  node: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(ClientInfo)
