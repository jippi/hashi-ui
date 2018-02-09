import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import ReactTooltip from "react-tooltip"
import FontIcon from "material-ui/FontIcon"
import { grey200 } from "material-ui/styles/colors"
import AppendedReactTooltip from "../AppendedReactTooltip/AppendedReactTooltip"
import { NOMAD_WATCH_ALLOC_STATS, NOMAD_UNWATCH_ALLOC_STATS } from "../../sagas/event"

const sumAggregate = (total, val) => total + val
const mapBy = (val, key) => {
  return val.map(next => next[key])
}

class AllocationStatsUnit extends Component {
  constructor(props) {
    super(props)
    this.state = { active: null }
  }

  data() {
    const data = [
      { label: "Used", value: this.props.resource.Used, className: "complete" },
      { label: "Allocated", value: this.props.resource.Allocated, className: "running" }
    ]

    let max = this.props.resource.Allocated
    if (this.props.resource.Used > max) {
      max = this.props.resource.Used
      data[1].label = "Overallocation"
      data[1].className = "failed"
      data[1].value = this.props.resource.Used - this.props.resource.Allocated
    }

    const sum = mapBy(data, "value").reduce(sumAggregate, 0)

    return data.map(({ label, value, className }, index) => ({
      label,
      value,
      className,
      used: Math.round(value, 0),
      percent: Math.round(value / sum * 100, 0),
      offset: mapBy(data.slice(0, index), "value").reduce(sumAggregate, 0) / sum * 100
    }))
  }

  render() {
    let data = this.data()
    let percentSum = 0
    let self = this
    let tt = ""

    if (this.state.active) {
      tt = (
        <AppendedReactTooltip id={`alloc-stats-${this.props.ID}`} className="chart tt" type="light">
          <ol>
            {data.map(x => {
              return (
                <li key={x.label}>
                  <span className="label">
                    <span className={`color-swatch ${x.className}`} />
                    {x.label}
                  </span>
                  <span className="value">
                    {x.used} {this.props.suffix} ({x.percent}%)
                  </span>
                </li>
              )
            })}
          </ol>
        </AppendedReactTooltip>
      )
    }

    return (
      <div style={{ height: 20 }} className="chart distribution-bar">
        {tt}
        <svg data-tip data-for={`alloc-stats-${this.props.ID}`}>
          <g className="bars">
            {data.map(x => {
              let mouseenter = e => {
                self.setState({ active: x.label })
              }
              let mouseleave = e => {
                self.setState({ active: undefined })
              }

              let className = x.className

              if (self.state.active) {
                className = className + (self.state.active == x.label ? " active" : " inactive")
              }

              let el = (
                <rect
                  key={x.label}
                  width={x.percent + "%"}
                  height={20}
                  x={percentSum + "%"}
                  className={className}
                  onMouseEnter={mouseenter}
                  onMouseLeave={mouseleave}
                />
              )

              percentSum += x.percent
              return el
            })}
          </g>
          <rect width="100%" height="100%" className="border" />
        </svg>
      </div>
    )
  }
}

class AllocationStats extends Component {
  componentDidMount() {
    this.watch(this.props)
  }

  componentWillUnmount() {
    this.unwatch(this.props)
  }

  componentWillReceiveProps(nextProps) {
    // if we get a new allocation, unsubscribe from the old and subscribe to the new
    if (this.props.allocationID != nextProps.allocationID) {
      this.watch(nextProps)
      this.unwatch(this.props)
      return
    }

    // if the current allocation changed from running to something else, unsubscribe
    if (this.props.allocationClientStatus == "running" && nextProps.allocationClientStatus != "running") {
      this.unwatch(this.props)
    }

    // if the current allocation changed anything to running, subscrube to health
    if (this.props.allocationClientStatus != "running" && nextProps.allocationClientStatus == "running") {
      this.watch(nextProps)
    }
  }

  watch(props) {
    if (props.passive) {
      return
    }

    this.props.dispatch({
      type: NOMAD_WATCH_ALLOC_STATS,
      payload: {
        ID: props.allocationID,
        simple: true,
        interval: "3s"
      }
    })
  }

  unwatch(props) {
    if (props.passive) {
      return
    }

    props.dispatch({
      type: NOMAD_UNWATCH_ALLOC_STATS,
      payload: {
        ID: props.allocationID,
        simple: true,
        interval: "3s"
      }
    })
  }

  render() {
    if (this.props.allocationClientStatus != "running") {
      return null
    }

    if (!this.props.stats) {
      return (
        <FontIcon title="Loading ..." color={grey200} className="material-icons">
          help_outline
        </FontIcon>
      )
    }

    switch (this.props.type) {
      case "cpu":
        return <AllocationStatsUnit suffix="MHz" id={this.props.allocationID} resource={this.props.stats.CPU} />
      case "memory":
        return <AllocationStatsUnit suffix="MB" id={this.props.allocationID} resource={this.props.stats.Memory} />
      default:
        return <div>Unknown resource type</div>
    }
  }
}

function mapStateToProps({ allocStats }, { allocation }) {
  return {
    allocationID: allocation.ID,
    allocationClientStatus: allocation.ClientStatus,
    stats: allocStats[allocation.ID]
  }
}

AllocationStats.defaultProps = {
  passive: false
}

AllocationStats.propTypes = {
  allocationID: PropTypes.string.isRequired,
  allocationClientStatus: PropTypes.string.isRequired,
  stats: PropTypes.object,
  passive: PropTypes.bool,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(AllocationStats)
