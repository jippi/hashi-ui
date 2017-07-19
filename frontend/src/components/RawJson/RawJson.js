import React, { Component, PropTypes } from "react"
import JSONFormatter from "json-formatter-js"

class Json extends Component {
  componentDidMount() {
    const formatter = new JSONFormatter(this.props.json, 2, {
      hoverPreviewEnabled: true,
      hoverPreviewArrayCount: 100,
      hoverPreviewFieldCount: 5,
    })
    this.json.appendChild(formatter.render())
  }

  componentDidUpdate() {
    const formatter = new JSONFormatter(this.props.json, 2, {
      hoverPreviewEnabled: true,
      hoverPreviewArrayCount: 100,
      hoverPreviewFieldCount: 5,
    })

    // Remove the old JSON
    if (this.json.hasChildNodes()) {
      this.json.removeChild(this.json.childNodes[0])
    }
    // Add the new JSON
    this.json.appendChild(formatter.render())
  }

  render() {
    return (
      <div
        id="raw_json"
        ref={c => {
          this.json = c
        }}
      />
    )
  }
}

Json.propTypes = {
  json: PropTypes.object.isRequired,
}

export default Json
