import React, { Component, PropTypes } from "react"
import ReactTooltip from "react-tooltip"
import uuid from "node-uuid"

class MetaPayload extends Component {
  render() {
    const metaBag = this.props.metaBag || {}
    const dtWithClass = this.props.dtWithClass
    const sortKeys = this.props.sortKeys
    const asTooltip = this.props.asTooltip

    let keys = Object.keys(metaBag || {})
    if (keys.length === 0) {
      return <div>- No data found -</div>
    }

    const identifier = uuid.v1()
    const meta = []
    let metaTag = null

    if (sortKeys) {
      keys = keys.sort()
    }

    keys.forEach(key => {
      meta.push(<dt className={dtWithClass} key={`${key}dt`}>{key}</dt>)
      meta.push(<dd key={`${key}dd`}>{metaBag[key]}</dd>)
    })

    if (meta.length > 0) {
      metaTag = <dl className="dl-horizontal dl-tooltip">{meta}</dl>
    }

    if (asTooltip) {
      return (
        <div>
          <ReactTooltip id={`tooltip-${identifier}`}>{metaTag}</ReactTooltip>
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
  asTooltip: false,
}

MetaPayload.propTypes = {
  metaBag: PropTypes.object,
  dtWithClass: PropTypes.string.isRequired,
  sortKeys: PropTypes.bool.isRequired,
  asTooltip: PropTypes.bool.isRequired,
}

export default MetaPayload
