import React, { Component } from "react"
import PropTypes from "prop-types"
import ReactTooltip from "react-tooltip"

class MetaPayload extends Component {
  render() {
    const metaBag = this.props.metaBag || {}
    const dtWithClass = this.props.dtWithClass
    const sortKeys = this.props.sortKeys
    const asTooltip = this.props.asTooltip
    const identifier = this.props.identifier

    let keys = Object.keys(metaBag || {})
    if (keys.length === 0) {
      return <div>- No data found -</div>
    }

    const meta = []
    let metaTag = null

    if (sortKeys) {
      keys = keys.sort()
    }

    keys.forEach(key => {
      meta.push(
        <dt className={dtWithClass} key={`${key}dt`}>
          {key}
        </dt>
      )

      let v = metaBag[key]
      switch (typeof v) {
        case "boolean":
          v = v ? "true" : "false"
      }

      meta.push(
        <dd key={`${key}dd`}>
          {v}
        </dd>
      )
    })

    if (meta.length > 0) {
      metaTag = (
        <dl className="dl-horizontal dl-tooltip">
          {meta}
        </dl>
      )
    }

    if (asTooltip) {
      return (
        <div>
          <ReactTooltip id={`tooltip-${identifier}`}>
            {metaTag}
          </ReactTooltip>
          <span data-tip data-for={`tooltip-${identifier}`} className="dotted">
            {keys.length} keys
          </span>
        </div>
      )
    }

    return metaTag
  }
}

MetaPayload.defaultProps = {
  metaBag: {},
  dtWithClass: "default",
  sortKeys: true,
  asTooltip: false
}

MetaPayload.propTypes = {
  metaBag: PropTypes.object,
  dtWithClass: PropTypes.string.isRequired,
  identifier: PropTypes.string.isRequired,
  sortKeys: PropTypes.bool.isRequired,
  asTooltip: PropTypes.bool.isRequired
}

export default MetaPayload
