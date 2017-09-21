import React, { Component } from "react"
import PropTypes from "prop-types"
import TextField from "material-ui/TextField"
import { withRouter } from "react-router"

function debounce(func, wait, immediate) {
  var timeout

  return function() {
    var context = this,
      args = arguments
    var later = function() {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

class FilterFreetext extends Component {
  componentWillMount() {
    this.onChange = debounce(this.search.bind(this), 250)
  }

  componentDidMount() {
    if (this.props.focusOnLoad) {
      this.nameInput.focus()
    }

    const q = this.props.location.query || {}
    this.nameInput.input.value = q[this.props.query]
  }

  search(proxy, value) {
    const q = this.props.location.query || {}
    if (value == "") {
      delete q[this.props.query]
    } else {
      q[this.props.query] = value
    }

    this.props.router.push({
      pathname: this.props.location.pathname,
      query: q
    })
  }

  render() {
    const q = this.props.location.query || {}

    return (
      <TextField
        ref={input => {
          this.nameInput = input
        }}
        floatingLabelText={this.props.label}
        onChange={this.onChange}
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
