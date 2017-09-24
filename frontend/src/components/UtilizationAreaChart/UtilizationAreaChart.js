import React, { Component } from "react"
import PropTypes from "prop-types"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Card, CardTitle, CardText } from "material-ui/Card"

//
// borrowed from http://recharts.org/examples/#/en-US/examples/StackedAreaChart
//
// input:
//     data: [{name: 'x-axis-value', key1: value1, key2: value2, ... }]
//     items: [{name: 'y-axis-name', stroke: '#3060a0', fill: '#205090'}]
//

class UtilizationAreaChart extends Component {
  render() {
    let data = []
    this.props.data.map((item, index) => data.push(item))

    let reference,
      label = null
    if (this.props.allocated) {
      reference = <ReferenceLine y={this.props.allocated} label="Allocated" stroke="red" strokeDasharray="3 3" />
      label = [
        <dt style={{ color: "red" }}>Allocated</dt>,
        <dd style={{ color: "red" }}>{this.props.allocated.toFixed(0)}</dd>
      ]
    }

    return (
      <Card>
        <CardTitle title={this.props.title} />
        <CardText>
          <ResponsiveContainer height={400}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" />
              <YAxis />
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
            </AreaChart>
          </ResponsiveContainer>

          <div style={{ marginTop: "1rem" }}>
            <dl className="metrics">
              {this.props.items.map(item => [
                <dt style={{ color: item.stroke }}>{item.name}</dt>,
                <dd style={{ color: item.stroke }}>
                  {this.props.data[this.props.data.length - 1][item.name].toFixed(0)}
                </dd>
              ])}
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
  title: PropTypes.string.isRequired
}

export default UtilizationAreaChart
