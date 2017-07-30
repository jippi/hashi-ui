import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Card, CardTitle, CardText } from "material-ui/Card"
import RawJson from "../RawJson/RawJson"

const ClientRaw = ({ node }) =>
  <Card>
    <CardTitle title="Raw node data" />
    <CardText>
      <RawJson json={node} />
    </CardText>
  </Card>

function mapStateToProps({ node }) {
  return { node }
}

ClientRaw.propTypes = {
  node: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(ClientRaw)
