import React from "react"
import PropTypes from "prop-types"
import TextField from "material-ui/TextField"
import { withRouter } from "react-router"

const FilterFreetext = ({ label, query, location, router }) => {
  const q = location.query || {}

  return (
    <TextField
      floatingLabelText={label}
      value={q[query] || ""}
      onChange={(proxy, value) => {
        q[query] = value

        router.push({
          pathname: location.pathname,
          query: q
        })
      }}
    />
  )
}

FilterFreetext.propTypes = {
  location: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
  query: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired
}

export default withRouter(FilterFreetext)
