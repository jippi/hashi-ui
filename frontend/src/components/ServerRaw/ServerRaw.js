import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Card, CardTitle, CardText } from "material-ui/Card"
import RawJson from "../RawJson/RawJson"

const ServerRaw = ({ member }) =>
  <Card>
    <CardTitle title="Raw JSON" />
    <CardText>
      <RawJson json={member} />
    </CardText>
  </Card>

function mapStateToProps({ member }) {
  return { member }
}

ServerRaw.propTypes = {
  member: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(ServerRaw)
