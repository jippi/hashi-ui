import React from "react"
import PropTypes from "prop-types"
import { Link, withRouter } from "react-router"
import SelectField from "material-ui/SelectField"
import MenuItem from "material-ui/MenuItem"

const JobStatusFilter = ({ location, router }) => {
  const query = location.query || {}
  const title = "Job Status"

  const handleChange = (event, index, value) => {
    router.push({
      pathname: location.pathname,
      query: { ...query, job_status: value }
    })
  }

  return (
    <SelectField
      floatingLabelText={title}
      maxHeight={200}
      value={query.job_status || undefined}
      onChange={handleChange}
    >
      <MenuItem />
      <MenuItem value="running" primaryText="Running" />
      <MenuItem value="pending" primaryText="Pending" />
      <MenuItem value="dead" primaryText="Dead" />
    </SelectField>
  )
}

JobStatusFilter.propTypes = {
  location: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
}

export default withRouter(JobStatusFilter)
