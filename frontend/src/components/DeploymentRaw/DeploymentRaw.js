import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Card, CardTitle, CardText } from "material-ui/Card"
import RawJson from "../RawJson/RawJson"

const DeploymentRaw = ({ deployment }) =>
  <Card>
    <CardTitle title="Raw allocation data" />
    <CardText>
      <RawJson json={deployment} />
    </CardText>
  </Card>

function mapStateToProps({ deployment }) {
  return { deployment }
}

DeploymentRaw.propTypes = {
  deployment: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(DeploymentRaw)
