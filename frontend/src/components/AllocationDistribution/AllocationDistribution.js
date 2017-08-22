import React, { Component } from "react"
import PropTypes from "prop-types"
import ReactTooltip from "react-tooltip"

const sumAggregate = (total, val) => total + val
const mapBy = (val, key) => {
  return val.map(next => next[key])
}

class AllocationDistribution extends Component {
  constructor(props) {
    super(props)
    this.state = { active: null }
  }

  data() {
    const counter = {
      Queued: 0,
      Complete: 0,
      Failed: 0,
      Running: 0,
      Starting: 0,
      Lost: 0
    }

    if (this.props.job.JobSummary !== null) {
      const summary = this.props.job.JobSummary.Summary
      Object.keys(summary).forEach(taskGroupID => {
        counter.Queued += summary[taskGroupID].Queued
        counter.Complete += summary[taskGroupID].Complete
        counter.Failed += summary[taskGroupID].Failed
        counter.Running += summary[taskGroupID].Running
        counter.Starting += summary[taskGroupID].Starting
        counter.Lost += summary[taskGroupID].Lost
      })
    } else {
      Object.keys(counter).forEach(key => (counter[key] = "N/A"))
    }

    const data = [
      { label: "Queued", value: counter.Queued, className: "queued" },
      {
        label: "Starting",
        value: counter.Starting,
        className: "starting"
      },
      { label: "Running", value: counter.Running, className: "running" },
      {
        label: "Complete",
        value: counter.Complete,
        className: "complete"
      },
      { label: "Failed", value: counter.Failed, className: "failed" }
    ]

    const sum = mapBy(data, "value").reduce(sumAggregate, 0)

    return data.map(({ label, value, className }, index) => ({
      label,
      value,
      className,
      percent: sum > 0 ? value / sum * 100 : 0,
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
        <ReactTooltip id={`job-stats-${this.props.job.ID}`} className="tt" type="light">
          <ol>
            {data.map(x => {
              return (
                <li key={x.label}>
                  <span className="label">
                    <span className={`color-swatch ${x.className}`} />
                    {x.label}
                  </span>
                  <span className="value">
                    {x.value}
                  </span>
                </li>
              )
            })}
          </ol>
        </ReactTooltip>
      )
    }

    return (
      <div>
        <div style={{ height: 20 }} className="chart distribution-bar">
          {tt}
          <svg data-tip data-for={`job-stats-${this.props.job.ID}`}>
            <g className="bars">
              {data.map(x => {
                let mouseenter = e => {
                  self.setState({ active: x.label })
                }
                let mouseleave = e => {
                  self.setState({ active: null })
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
      </div>
    )
  }
}

AllocationDistribution.propTypes = {}

export default AllocationDistribution
