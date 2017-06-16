import React, { PropTypes } from "react"
import { Link, withRouter } from "react-router"
import SelectField from "material-ui/SelectField"
import MenuItem from "material-ui/MenuItem"

const JobStatusFilter = ({ location }) => {
  const query = location.query || {}

  let title = "Job Status"
  if ("job_status" in query) {
    title = <span>{title}: <code>{query.job_status}</code></span>
  }

  return (
    <SelectField floatingLabelText={title} maxHeight={200}>
      <MenuItem>
        <Link
          to={{
            pathname: location.pathname,
            query: { ...query, job_status: undefined },
          }}
        >
          - Any -
        </Link>
      </MenuItem>
      <MenuItem>
        <Link
          to={{
            pathname: location.pathname,
            query: { ...query, job_status: "running" },
          }}
        >
          Running
        </Link>
      </MenuItem>
      <MenuItem>
        <Link
          to={{
            pathname: location.pathname,
            query: { ...query, job_status: "pending" },
          }}
        >
          Pending
        </Link>
      </MenuItem>
      <MenuItem>
        <Link
          to={{
            pathname: location.pathname,
            query: { ...query, job_status: "dead" },
          }}
        >
          Dead
        </Link>
      </MenuItem>
    </SelectField>
  )
}

JobStatusFilter.propTypes = {
  location: PropTypes.object.isRequired,
}

export default withRouter(JobStatusFilter)
