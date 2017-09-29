import React, { Component } from "react"
import PropTypes from "prop-types"
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from "recharts"
import { Card, CardTitle, CardText } from "material-ui/Card"

//
// borrowed from http://recharts.org/examples/#/en-US/examples/StackedAreaChart
//
// input:
//     data: [{name: 'x-axis-value', key1: value1, key2: value2, ... }]
//     items: [{name: 'y-axis-name', stroke: '#3060a0', fill: '#205090'}]
//

const formatNumber = i => i.toLocaleString(undefined, { maximumFractionDigits: 0 })

class UtilizationAreaChart extends Component {
  render() {
    let data = []
    this.props.data.map((item, index) => { data.push(item) })

      let reference,
      label = null
    if (this.props.allocated) {
      reference = <Line isAnimationActive={false} dot={false} strokeWidth={2} dataKey="Allocated" stroke="red" stackId="2" />
      label = [
        <dt key="allocated-dt" style={{ color: "red" }}>
          Allocated
        </dt>,
        <dd key="allocated-dd" style={{ color: "red", textAlign: "right" }}>
          {formatNumber(data[data.length - 1].Allocated)}
        </dd>
      ]
    }

    let min = 'auto'
    let max = 'auto'
    if (this.props.max) { max = this.props.max }
    if (this.props.min) { min = this.props.min }

    return (
      <Card>
        <CardTitle title={this.props.title} />
        <CardText>
          <ResponsiveContainer height={230}>
            <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" />
              <YAxis type="number" domain={[min, max]}/>
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              {reference}
              {this.props.items.map(item => (
                <Area
                  key={item.name}
                  isAnimationActive={false}
                  type="monotone"
                  dataKey={item.name}
                  stackId="1"
                  stroke={item.stroke}
                  fill={item.fill}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>

          <div style={{ marginTop: "1rem", margin: "0 auto", display: "table" }}>
            <dl className="metrics" style={{ width: 250 }}>
              {this.props.items.map(item => {
                let value = data[data.length - 1][item.name]
                return [
                  <dt style={{ color: item.stroke }}>{item.name}</dt>,
                  <dd style={{ color: item.stroke, textAlign: "right" }}>
                    {formatNumber(value)}
                  </dd>
                ]
              })}
              {label}
            </dl>
          </div>
        </CardText>
      </Card>
    )
  }
}

UtilizationAreaChart.propTypes = {
  data: PropTypes.array.isRequired,
  items: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  allocated: PropTypes.bool
}

export default UtilizationAreaChart
