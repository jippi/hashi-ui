import React, { PropTypes } from "react"
import { Link, withRouter } from "react-router"
import SelectField from "material-ui/SelectField"
import MenuItem from "material-ui/MenuItem"

const JobTypeFilter = ({ location }) => {
  const query = location.query || {}

  let title = "Job Type"
  if ("job_type" in query) {
    title = <span>{title}: <code>{query.job_type}</code></span>
  }

  return (
    <SelectField floatingLabelText={title} maxHeight={200}>
      <MenuItem>
        <Link
          to={{
            pathname: location.pathname,
            query: { ...query, job_type: undefined },
          }}
        >
          - Any -
        </Link>
      </MenuItem>
      <MenuItem>
        <Link
          to={{
            pathname: location.pathname,
            query: { ...query, job_type: "system" },
          }}
        >
          System
        </Link>
      </MenuItem>
      <MenuItem>
        <Link
          to={{
            pathname: location.pathname,
            query: { ...query, job_type: "batch" },
          }}
        >
          Batch
        </Link>
      </MenuItem>
      <MenuItem>
        <Link
          to={{
            pathname: location.pathname,
            query: { ...query, job_type: "service" },
          }}
        >
          Service
        </Link>
      </MenuItem>
    </SelectField>
  )
}

JobTypeFilter.propTypes = {
  location: PropTypes.object.isRequired,
}

export default withRouter(JobTypeFilter)
