import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Card, CardTitle, CardText } from "material-ui/Card"
import RawJson from "../RawJson/RawJson"

const JobRaw = ({ job }) =>
  <Card>
    <CardTitle title="Raw job data" />
    <CardText>
      <RawJson json={job} />
    </CardText>
  </Card>

function mapStateToProps({ job }) {
  return { job }
}

JobRaw.propTypes = {
  job: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(JobRaw)
