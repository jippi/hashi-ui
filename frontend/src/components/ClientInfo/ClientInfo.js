import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import MetaPayload from "../MetaPayload/MetaPayload"
import { Grid, Row, Col } from "react-flexbox-grid"
import { Card, CardTitle, CardText } from "material-ui/Card"

const nodeProps = ["ID", "Name", "Status", "Datacenter", "Drain", "SchedulingEligibility", "HTTPAddr", "NodeClass"]

const withPrefix = function withPrefix(obj, prefix) {
  const result = {}

  Object.keys(obj || {}).forEach(key => {
    if (key.startsWith(prefix)) {
      result[key.replace(prefix, "")] = obj[key]
    }
  })

  return result
}

const speialProps = function speialProps(obj) {
  const result = {}
  nodeProps.forEach(v => {
    result[v] = obj[v]
  })

  return result
}

const ClientInfo = ({ node }) =>
  <Grid fluid style={{ padding: 0 }}>
    <Row style={{ marginTop: "1rem" }}>
      <Col key="resource-pane" xs={12} sm={12} md={6} lg={6}>
        <Card key="client">
          <CardTitle title="Client Properties" />
          <CardText>
            <MetaPayload dtWithClass="wide" metaBag={speialProps(node)} sortKeys={false} identifier="client" />
          </CardText>
        </Card>
        <Card key="nomad">
          <CardTitle title="Nomad Properties" />
          <CardText>
            <MetaPayload dtWithClass="wide" metaBag={withPrefix(node.Attributes, "nomad.")} identifier="nomad" />
          </CardText>
        </Card>
        <Card key="vault">
          <CardTitle title="Vault Properties" />
          <CardText>
            <MetaPayload dtWithClass="wide" metaBag={withPrefix(node.Attributes, "vault.")} identifier="vault" />
          </CardText>
        </Card>
        <Card key="cpu">
          <CardTitle title="CPU Properties" />
          <CardText>
            <MetaPayload dtWithClass="wide" metaBag={withPrefix(node.Attributes, "cpu.")} identifier="cpu" />
          </CardText>
        </Card>
        <Card key="memory">
          <CardTitle title="Memory Properties" />
          <CardText>
            <MetaPayload dtWithClass="wide" metaBag={withPrefix(node.Attributes, "memory.")} identifier="memory" />
          </CardText>
        </Card>
        <Card key="kernel">
          <CardTitle title="Kernel Properties" />
          <CardText>
            <MetaPayload dtWithClass="wide" metaBag={withPrefix(node.Attributes, "kernel.")} identifier="kernel" />
          </CardText>
        </Card>
        <Card key="os">
          <CardTitle title="OS Properties" />
          <CardText>
            <MetaPayload dtWithClass="wide" metaBag={withPrefix(node.Attributes, "os.")} identifier="os" />
          </CardText>
        </Card>
      </Col>
      <Col key="driver-pane" xs={12} sm={12} md={6} lg={6}>
        <Card key="meta">
          <CardTitle title="Meta Properties" />
          <CardText>
            <MetaPayload dtWithClass="wide" metaBag={node.Meta} identifier="meta" />
          </CardText>
        </Card>
        <Card key="consul">
          <CardTitle title="Consul Properties" />
          <CardText>
            <MetaPayload dtWithClass="wide" metaBag={withPrefix(node.Attributes, "consul.")} identifier="consul" />
          </CardText>
        </Card>
        <Card key="driver">
          <CardTitle title="Driver Properties" />
          <CardText>
            <MetaPayload dtWithClass="wide" metaBag={withPrefix(node.Attributes, "driver.")} identifier="driver" />
          </CardText>
        </Card>
        <Card key="unique">
          <CardTitle title="Unique Properties" />
          <CardText>
            <MetaPayload dtWithClass="wide" metaBag={withPrefix(node.Attributes, "unique.")} identifier="unique" />
          </CardText>
        </Card>
      </Col>
    </Row>
  </Grid>

function mapStateToProps({ node }) {
  return { node }
}

ClientInfo.propTypes = {
  node: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(ClientInfo)
