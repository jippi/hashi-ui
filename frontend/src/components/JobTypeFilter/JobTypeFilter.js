import React from "react"
import PropTypes from "prop-types"
import { withRouter } from "react-router"
import SelectField from "material-ui/SelectField"
import MenuItem from "material-ui/MenuItem"

const JobTypeFilter = ({ location, router }) => {
  const query = location.query || {}
  const title = "Job Type"

  const handleChange = (event, index, value) => {
    router.push({
      pathname: location.pathname,
      query: { ...query, job_type: value }
    })
  }

  return (
    <SelectField floatingLabelText={title} maxHeight={200} value={query.job_type} onChange={handleChange}>
      <MenuItem />
      <MenuItem value="system" primaryText="System" />
      <MenuItem value="batch" primaryText="Batch" />
      <MenuItem value="service" primaryText="Service" />
    </SelectField>
  )
}

JobTypeFilter.propTypes = {
  location: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
}

export default withRouter(JobTypeFilter)
