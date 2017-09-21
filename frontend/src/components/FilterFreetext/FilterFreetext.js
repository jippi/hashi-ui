import React, { Component } from "react"
import PropTypes from "prop-types"
import TextField from "material-ui/TextField"
import { withRouter } from "react-router"

class FilterFreetext extends Component {
  componentDidMount() {
    if (this.props.focusOnLoad) {
      this.nameInput.focus()
    }
  }

  render() {
    const q = this.props.location.query || {}

    return (
      <TextField
        ref={a => {
          this.nameInput = a
        }}
        floatingLabelText={this.props.label}
        value={q[this.props.query] || ""}
        onChange={(proxy, value) => {
          q[this.props.query] = value

          router.push({
            pathname: this.props.location.pathname,
            query: q
          })
        }}
      />
    )
  }
}

FilterFreetext.propTypes = {
  location: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
  query: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  focusOnLoad: PropTypes.bool
}

export default withRouter(FilterFreetext)
