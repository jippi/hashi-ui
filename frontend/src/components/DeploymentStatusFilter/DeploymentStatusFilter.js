import React from "react"
import PropTypes from "prop-types"
import { withRouter } from "react-router"
import SelectField from "material-ui/SelectField"
import MenuItem from "material-ui/MenuItem"

const DeploymentStatusFilter = ({ location, router }) => {
  const query = location.query || {}
  const title = "Status"

  const handleChange = (event, index, value) => {
    router.push({
      pathname: location.pathname,
      query: { ...query, status: value }
    })
  }

  return (
    <SelectField floatingLabelText={title} maxHeight={200} value={query.status} onChange={handleChange}>
      <MenuItem />
      <MenuItem value="running" primaryText="Running" />
      <MenuItem value="successful" primaryText="Successful" />
      <MenuItem value="failed" primaryText="Failed" />
    </SelectField>
  )
}

DeploymentStatusFilter.propTypes = {
  location: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
}

export default withRouter(DeploymentStatusFilter)
